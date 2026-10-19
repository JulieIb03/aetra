<?php
/**
 * Importa el contenido del sitio estático AETRA a WordPress.
 * Uso: wp eval-file import.php --user=1   (idempotente: actualiza si ya existe)
 */
$data   = json_decode( file_get_contents( __DIR__ . '/aetra-data.json' ), true );
$assets = dirname( __DIR__ ) . '/assets/';
require_once ABSPATH . 'wp-admin/includes/image.php';
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/media.php';

/* ---------- Medios ---------- */
$media = [];
foreach ( $data['media'] as $file => $alt ) {
	$existing = get_posts( [ 'post_type' => 'attachment', 'meta_key' => '_aetra_source', 'meta_value' => $file, 'fields' => 'ids', 'posts_per_page' => 1 ] );
	if ( $existing ) {
		$media[ $file ] = $existing[0];
		continue;
	}
	$tmp = wp_tempnam( $file );
	copy( $assets . $file, $tmp );
	$id = media_handle_sideload( [ 'name' => $file, 'tmp_name' => $tmp ], 0, pathinfo( $file, PATHINFO_FILENAME ) );
	if ( is_wp_error( $id ) ) {
		WP_CLI::warning( "$file: " . $id->get_error_message() );
		continue;
	}
	update_post_meta( $id, '_wp_attachment_image_alt', $alt );
	update_post_meta( $id, '_aetra_source', $file );
	$media[ $file ] = $id;
	WP_CLI::log( "Imagen $file → $id" );
}

/* ---------- Utilidades ---------- */
function aetra_upsert( $type, $slug, $title, $args = [] ) {
	$found = get_posts( [ 'post_type' => $type, 'name' => $slug, 'post_status' => 'any', 'posts_per_page' => 1, 'fields' => 'ids' ] );
	$post  = array_merge( [ 'post_type' => $type, 'post_name' => $slug, 'post_title' => $title, 'post_status' => 'publish' ], $args );
	if ( $found ) {
		$post['ID'] = $found[0];
		return wp_update_post( $post );
	}
	return wp_insert_post( $post );
}

$resolve_img = function ( $value ) use ( $media ) {
	if ( is_string( $value ) && str_starts_with( $value, '@' ) ) {
		return $media[ substr( $value, 1 ) ] ?? '';
	}
	return $value;
};

// Se guarda con la clave del campo (no el nombre) porque varios grupos comparten nombres como hero_titulo.
function aetra_set_fields( $post_id, $fields, $resolve_img, $group ) {
	foreach ( $fields as $name => $value ) {
		if ( is_array( $value ) ) {
			$value = array_map( $resolve_img, $value );
		} else {
			$value = $resolve_img( $value );
		}
		update_field( "field_aetra_{$group}_{$name}", $value, $post_id );
	}
}

/* ---------- Páginas ---------- */
$pages = [
	'inicio'                 => [ 'Inicio', '', 'inicio' ],
	'sobre-nosotros'         => [ 'Sobre nosotros', 'template-about.php', 'about' ],
	'dra-paola-parra'        => [ 'Dra. Paola Parra', 'template-dra.php', 'dra' ],
	'equipo-y-tecnologia'    => [ 'Equipo y tecnología', 'template-equipo.php', 'equipo' ],
	'enfermedades-y-terapias'=> [ 'Enfermedades y terapias', 'template-hub.php', 'hub' ],
	'valoracion-inicial'     => [ 'Valoración inicial', 'template-valoracion.php', 'valoracion' ],
	'preguntas-frecuentes'   => [ 'Preguntas frecuentes', 'template-faq.php', 'faq' ],
	'ajustes-del-sitio'      => [ 'Ajustes del sitio', 'template-ajustes.php', 'ajustes' ],
];
$page_ids = [];
foreach ( $pages as $slug => [ $title, $template, $key ] ) {
	$id = aetra_upsert( 'page', $slug, $title, [ 'post_status' => 'ajustes' === $key ? 'private' : 'publish', 'post_content' => '' ] );
	if ( $template ) {
		update_post_meta( $id, '_wp_page_template', $template );
	}
	$page_ids[ $key ] = $id;
}
update_option( 'show_on_front', 'page' );
update_option( 'page_on_front', $page_ids['inicio'] );

/* ---------- Post types ---------- */
$order = 0;
$prog_ids = [];
foreach ( $data['programas'] as $p ) {
	$id = aetra_upsert( 'programa', $p['slug'], $p['titulo'], [ 'menu_order' => $order++ ] );
	aetra_set_fields( $id, $p['fields'], $resolve_img, 'programa' );
	$prog_ids[ $p['slug'] ] = $id;
}
$order = 0;
$ter_ids = [];
foreach ( $data['terapias'] as $t ) {
	$slug = $t['slug'];
	$id   = aetra_upsert( 'terapia', $slug, $t['titulo'], [ 'post_content' => $t['contenido'], 'post_excerpt' => $t['extracto'], 'menu_order' => $order++ ] );
	aetra_set_fields( $id, $t['fields'] + [ 'seo_descripcion' => $t['meta'] ], $resolve_img, 'terapia' );
	$ter_ids[ $slug ] = $id;
}
$order = 0;
$enf_ids = [];
foreach ( $data['enfermedades'] as $e ) {
	$id = aetra_upsert( 'enfermedad', $e['slug'], $e['titulo'], [ 'post_content' => $e['contenido'], 'post_excerpt' => $e['extracto'], 'menu_order' => $order++ ] );
	aetra_set_fields( $id, $e['fields'] + [ 'seo_descripcion' => $e['meta'] ], $resolve_img, 'enfermedad' );
	update_field( 'field_aetra_enfermedad_terapias', array_values( array_filter( array_map( fn( $s ) => $ter_ids[ $s ] ?? 0, $e['terapias'] ) ) ), $id );
	$enf_ids[ $e['slug'] ] = $id;
}
foreach ( [ 'profesional' => 'profesionales', 'historia' => 'historias', 'pregunta' => 'preguntas' ] as $type => $key ) {
	foreach ( get_posts( [ 'post_type' => $type, 'posts_per_page' => -1, 'post_status' => 'any', 'fields' => 'ids' ] ) as $old ) {
		wp_delete_post( $old, true );
	}
	foreach ( $data[ $key ] as $n => $item ) {
		$args = [ 'menu_order' => $n ];
		if ( 'pregunta' === $type ) {
			$args['post_content'] = $item['contenido'];
		}
		$id = aetra_upsert( $type, sanitize_title( $item['titulo'] . '-' . $n ), $item['titulo'], $args );
		if ( 'profesional' === $type ) {
			update_field( 'field_aetra_profesional_especialidad', $item['especialidad'], $id );
			if ( $item['foto'] ) {
				set_post_thumbnail( $id, $resolve_img( $item['foto'] ) );
			}
		}
		if ( 'historia' === $type ) {
			set_post_thumbnail( $id, $resolve_img( $item['imagen'] ) );
			update_field( 'field_aetra_historia_youtube', $item['youtube'], $id );
			update_field( 'field_aetra_historia_formato', $item['formato'], $id );
		}
	}
}

/* ---------- Páginas heredadas (contenido HTML en el editor) ---------- */
$legacy_ids = [];
foreach ( $data['legado'] as $slug => $l ) {
	$legacy_ids[ $slug ] = aetra_upsert( 'page', $slug, $l['titulo'], [ 'post_content' => '' ] );
}

/* ---------- Resolución de enlaces {{link:archivo}} e imágenes {{img:archivo}} ---------- */
$link_map = [
	'index'                   => home_url( '/' ),
	'about'                   => get_permalink( $page_ids['about'] ),
	'aetra'                   => get_permalink( $page_ids['about'] ),
	'dra-paola-parra'         => get_permalink( $page_ids['dra'] ),
	'equipo'                  => get_permalink( $page_ids['equipo'] ),
	'enfermedades-y-terapias' => get_permalink( $page_ids['hub'] ),
	'soluciones'              => get_permalink( $page_ids['hub'] ),
	'valoracion-inicial'      => get_permalink( $page_ids['valoracion'] ),
	'preguntas-frecuentes'    => get_permalink( $page_ids['faq'] ),
	'programas'               => get_post_type_archive_link( 'programa' ),
];
foreach ( $prog_ids as $slug => $id ) {
	$link_map[ "programa-$slug" ] = get_permalink( $id );
}
foreach ( $ter_ids as $slug => $id ) {
	$link_map[ str_starts_with( $slug, 'terapia-' ) ? $slug : "terapia-$slug" ] = get_permalink( $id );
}
foreach ( $enf_ids as $slug => $id ) {
	$link_map[ "enfermedad-$slug" ] = get_permalink( $id );
}
foreach ( $legacy_ids as $slug => $id ) {
	$link_map[ $slug ] = get_permalink( $id );
}
$resolve_html = function ( $html ) use ( $link_map, $media ) {
	$html = preg_replace_callback( '/\{\{link:([a-z0-9-]+)\}\}/', function ( $m ) use ( $link_map ) {
		if ( ! isset( $link_map[ $m[1] ] ) ) {
			WP_CLI::warning( "Enlace sin destino: {$m[1]}" );
			return home_url( '/' );
		}
		return $link_map[ $m[1] ];
	}, $html );
	return preg_replace_callback( '/\{\{img:([^}]+)\}\}/', fn( $m ) => isset( $media[ $m[1] ] ) ? wp_get_attachment_url( $media[ $m[1] ] ) : '', $html );
};

foreach ( $data['legado'] as $slug => $l ) {
	// Bloque HTML personalizado: se renderiza tal cual (sin wpautop) y queda editable.
	wp_update_post( [ 'ID' => $legacy_ids[ $slug ], 'post_content' => "<!-- wp:html -->\n" . $resolve_html( $l['contenido'] ) . "\n<!-- /wp:html -->" ] );
}
foreach ( get_posts( [ 'post_type' => 'pregunta', 'posts_per_page' => -1 ] ) as $q ) {
	wp_update_post( [ 'ID' => $q->ID, 'post_content' => $resolve_html( $q->post_content ) ] );
}

/* ---------- Campos de páginas ---------- */
foreach ( [ 'inicio', 'about', 'dra', 'equipo', 'hub', 'valoracion', 'faq', 'ajustes' ] as $key ) {
	$fields = $data[ $key ];
	foreach ( $fields as $name => $value ) {
		if ( is_string( $value ) ) {
			$fields[ $name ] = $resolve_html( $value );
		}
	}
	aetra_set_fields( $page_ids[ $key ], $fields, $resolve_img, $key );
}

flush_rewrite_rules();
WP_CLI::success( sprintf( 'Importado: %d imágenes, %d páginas, %d programas, %d enfermedades, %d terapias.', count( $media ), count( $page_ids ) + count( $legacy_ids ), count( $prog_ids ), count( $enf_ids ), count( $ter_ids ) ) );
