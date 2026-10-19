<?php
/**
 * Crea la versión en inglés del sitio (Polylang) a partir de en-data.json.
 * Uso: wp eval-file import-en.php --user=1   (idempotente: actualiza si ya existe)
 */
$data = json_decode( file_get_contents( __DIR__ . '/en-data.json' ), true );

/** Crea o actualiza la traducción EN de un post en español y la enlaza. */
function aetra_en_upsert( $es_id, $args ) {
	$en_id = pll_get_post( $es_id, 'en' );
	$post  = array_merge( [ 'post_type' => get_post_type( $es_id ), 'post_status' => get_post_status( $es_id ), 'menu_order' => get_post_field( 'menu_order', $es_id ) ], $args );
	if ( $en_id ) {
		$post['ID'] = $en_id;
		wp_update_post( $post );
	} else {
		$en_id = wp_insert_post( $post );
	}
	pll_set_post_language( $en_id, 'en' );
	pll_save_post_translations( [ 'es' => $es_id, 'en' => $en_id ] );
	$tpl = get_post_meta( $es_id, '_wp_page_template', true );
	if ( $tpl ) {
		update_post_meta( $en_id, '_wp_page_template', $tpl );
	}
	$thumb = get_post_thumbnail_id( $es_id );
	if ( $thumb ) {
		set_post_thumbnail( $en_id, $thumb );
	}
	return $en_id;
}

/**
 * Copia los campos ACF del original (imágenes, números…) y aplica los textos en inglés.
 * $only_groups: copia solo los campos de grupo (los demás se heredan del español al leerse).
 */
function aetra_en_fields( $es_id, $en_id, $prefix, $overrides, $only_groups = false ) {
	foreach ( acf_get_field_groups( [ 'post_id' => $es_id ] ) as $group ) {
		foreach ( acf_get_fields( $group ) as $field ) {
			if ( 'tab' === $field['type'] || ( $only_groups && 'group' !== $field['type'] ) ) {
				continue;
			}
			$value = get_field( $field['key'], $es_id, false );
			if ( null !== $value && '' !== $value ) {
				update_field( $field['key'], $value, $en_id );
			}
		}
	}
	foreach ( $overrides as $name => $value ) {
		$key = "field_aetra_{$prefix}_{$name}";
		if ( is_array( $value ) ) {
			$current = (array) get_field( $key, $en_id, false );
			foreach ( $value as $sub => $v ) {
				$current[ "{$key}_{$sub}" ] = $v;
			}
			$value = $current;
		}
		update_field( $key, $value, $en_id );
	}
}

/* ---------- Páginas ---------- */
$templates = [ 'about' => 'template-about.php', 'dra' => 'template-dra.php', 'equipo' => 'template-equipo.php', 'hub' => 'template-hub.php', 'valoracion' => 'template-valoracion.php', 'faq' => 'template-faq.php', 'ajustes' => 'template-ajustes.php' ];
$es_pages  = [ 'inicio' => (int) get_option( 'page_on_front' ) ];
foreach ( $templates as $key => $tpl ) {
	$es_pages[ $key ] = aetra_page_id_by_template( $tpl, 'es' );
}
$en_pages = [];
foreach ( $data['pages'] as $key => $p ) {
	$en_pages[ $key ] = aetra_en_upsert( $es_pages[ $key ], [ 'post_title' => $p['title'], 'post_name' => $p['slug'], 'post_content' => '' ] );
}

/* ---------- Programas, terapias y enfermedades ---------- */
$es_ids = fn( $type ) => array_column( array_map( fn( $p ) => [ $p->post_name, $p->ID ], get_posts( [ 'post_type' => $type, 'posts_per_page' => -1, 'lang' => 'es' ] ) ), 1, 0 );
$prog   = $es_ids( 'programa' );
foreach ( $data['programas'] as $slug => $p ) {
	$en = aetra_en_upsert( $prog[ $slug ], [ 'post_title' => get_the_title( $prog[ $slug ] ), 'post_name' => $p['slug'] ] );
	aetra_en_fields( $prog[ $slug ], $en, 'programa', $p['fields'] );
}
$ter     = $es_ids( 'terapia' );
$ter_map = [];
foreach ( $data['terapias'] as $slug => $t ) {
	$en = aetra_en_upsert( $ter[ $slug ], [ 'post_title' => $t['title'], 'post_name' => $t['slug'], 'post_content' => $t['content'], 'post_excerpt' => $t['excerpt'] ] );
	aetra_en_fields( $ter[ $slug ], $en, 'terapia', $t['fields'] );
	$ter_map[ $ter[ $slug ] ] = $en;
}
$enf = $es_ids( 'enfermedad' );
foreach ( $data['enfermedades'] as $slug => $e ) {
	$en = aetra_en_upsert( $enf[ $slug ], [ 'post_title' => $e['title'], 'post_name' => $e['slug'], 'post_content' => $e['content'], 'post_excerpt' => $e['excerpt'] ] );
	aetra_en_fields( $enf[ $slug ], $en, 'enfermedad', $e['fields'] );
	$related = array_map( fn( $id ) => (string) ( $ter_map[ (int) $id ] ?? $id ), (array) get_field( 'field_aetra_enfermedad_terapias', $enf[ $slug ], false ) );
	update_field( 'field_aetra_enfermedad_terapias', $related, $en );
}

/* ---------- Equipo, historias y preguntas (mismo orden que en español) ---------- */
$by_order = fn( $type ) => get_posts( [ 'post_type' => $type, 'posts_per_page' => -1, 'lang' => 'es', 'orderby' => 'menu_order', 'order' => 'ASC' ] );
foreach ( $by_order( 'profesional' ) as $n => $p ) {
	[ $name, $spec ] = $data['profesionales'][ $n ];
	$en = aetra_en_upsert( $p->ID, [ 'post_title' => $name, 'post_name' => sanitize_title( "$name-en-$n" ) ] );
	update_field( 'field_aetra_profesional_especialidad', $spec, $en );
}
foreach ( $by_order( 'historia' ) as $n => $p ) {
	$en = aetra_en_upsert( $p->ID, [ 'post_title' => $p->post_title, 'post_name' => sanitize_title( $p->post_title . "-en-$n" ) ] );
	aetra_en_fields( $p->ID, $en, 'historia', [] );
}

/* ---------- Enlaces internos en inglés ---------- */
$media    = [];
foreach ( get_posts( [ 'post_type' => 'attachment', 'posts_per_page' => -1, 'meta_key' => '_aetra_source' ] ) as $a ) {
	$media[ get_post_meta( $a->ID, '_aetra_source', true ) ] = $a->ID;
}
$link_map = [
	'valoracion-inicial'      => get_permalink( $en_pages['valoracion'] ),
	'preguntas-frecuentes'    => get_permalink( $en_pages['faq'] ),
	'enfermedades-y-terapias' => get_permalink( $en_pages['hub'] ),
	'terapia-bioresonancia'   => get_permalink( pll_get_post( $ter['bioresonancia'], 'en' ) ),
];
$resolve = function ( $html ) use ( &$link_map, $media ) {
	$html = preg_replace_callback( '/\{\{link:([a-z0-9-]+)\}\}/', fn( $m ) => $link_map[ $m[1] ] ?? home_url( '/en/' ), $html );
	return preg_replace_callback( '/\{\{img:([^}]+)\}\}/', fn( $m ) => isset( $media[ $m[1] ] ) ? wp_get_attachment_url( $media[ $m[1] ] ) : '', $html );
};

foreach ( $by_order( 'pregunta' ) as $n => $p ) {
	[ $q, $a ] = $data['preguntas'][ $n ];
	aetra_en_upsert( $p->ID, [ 'post_title' => $q, 'post_name' => sanitize_title( $q ), 'post_content' => '<p>' . $resolve( $a ) . '</p>' ] );
}

/* ---------- Campos de páginas ---------- */
foreach ( $data['pages'] as $key => $p ) {
	$fields = array_map( fn( $v ) => is_string( $v ) ? $resolve( $v ) : $v, $p['fields'] );
	aetra_en_fields( $es_pages[ $key ], $en_pages[ $key ], $key, $fields, 'ajustes' === $key );
}

/* ---------- Páginas heredadas ---------- */
foreach ( $data['legado'] as $slug => $l ) {
	$es = get_page_by_path( $slug );
	aetra_en_upsert( $es->ID, [ 'post_title' => $l['title'], 'post_name' => $l['slug'], 'post_content' => "<!-- wp:html -->\n" . $resolve( $l['content'] ) . "\n<!-- /wp:html -->" ] );
}

/* ---------- Menús en inglés ---------- */
$item_page = fn( $id ) => [ 'menu-item-type' => 'post_type', 'menu-item-object' => 'page', 'menu-item-object-id' => $id, 'menu-item-title' => get_the_title( $id ), 'menu-item-status' => 'publish' ];
$main      = [ $item_page( $en_pages['about'] ), $item_page( $en_pages['dra'] ), [ 'menu-item-type' => 'post_type_archive', 'menu-item-object' => 'programa', 'menu-item-title' => 'Programs', 'menu-item-status' => 'publish' ], $item_page( $en_pages['equipo'] ), $item_page( $en_pages['hub'] ) ];
$menus     = [
	'principal'       => [ 'Main menu (EN)', $main ],
	'footer_aetra'    => [ 'AETRA (EN)', $main ],
	'footer_recursos' => [ 'Resources (EN)', [ $item_page( $en_pages['faq'] ), array_merge( $item_page( $en_pages['valoracion'] ), [ 'menu-item-title' => 'Book your assessment' ] ) ] ],
];
$options = get_option( 'polylang' );
foreach ( $menus as $location => [ $name, $items ] ) {
	$menu = wp_get_nav_menu_object( $name );
	if ( $menu ) {
		foreach ( wp_get_nav_menu_items( $menu->term_id ) ?: [] as $old ) {
			wp_delete_post( $old->ID, true );
		}
		$menu_id = $menu->term_id;
	} else {
		$menu_id = wp_create_nav_menu( $name );
	}
	foreach ( $items as $pos => $item ) {
		wp_update_nav_menu_item( $menu_id, 0, $item + [ 'menu-item-position' => $pos + 1 ] );
	}
	// Polylang guarda el menú de cada idioma por ubicación.
	$options['nav_menus'][ get_stylesheet() ][ $location ]['en'] = $menu_id;
	$options['nav_menus'][ get_stylesheet() ][ $location ]['es'] = get_theme_mod( 'nav_menu_locations', [] )[ $location ] ?? 0;
}
update_option( 'polylang', $options );

/* ---------- Texto alternativo de las imágenes en inglés ---------- */
foreach ( $data['media_alt'] as $file => $alt ) {
	if ( isset( $media[ $file ] ) ) {
		update_field( 'field_aetra_medio_alt_en', $alt, $media[ $file ] );
	}
}

/* ---------- Cadenas de la interfaz ---------- */
$lang = PLL()->model->get_language( 'en' );
$mo   = new PLL_MO();
$mo->import_from_db( $lang );
foreach ( $data['strings'] as $es => $en ) {
	$mo->add_entry( $mo->make_entry( $es, $en ) );
}
$mo->export_to_db( $lang );

flush_rewrite_rules();
WP_CLI::success( 'Versión en inglés creada: ' . count( $en_pages ) . ' páginas, ' . count( $data['enfermedades'] ) . ' enfermedades, ' . count( $data['terapias'] ) . ' terapias.' );
