const {chromium}=require('playwright');
const fs=require('fs');
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 const pages=['index','aetra','equipo','soluciones','programas','valoracion-inicial','test-longevidad','articulos','preguntas-frecuentes','contacto','terminos'];
 const issues=[];const reports=[];
 for(const width of [390,768,1024,1440]){
  const page=await browser.newPage({viewport:{width,height:960},reducedMotion:'reduce'});
  page.on('pageerror',e=>issues.push({width,error:e.message}));
  for(const name of pages){
   await page.goto('http://127.0.0.1:8765/'+name+'.html');await page.evaluate(()=>document.fonts.ready);
   const data=await page.evaluate(async()=>{
    await Promise.all([...document.images].map(i=>{i.loading='eager';return i.decode().catch(()=>{});}));
    const ids=[...document.querySelectorAll('[id]')].map(x=>x.id);
    return {width:document.documentElement.scrollWidth,viewport:innerWidth,h1:document.querySelectorAll('h1').length,broken:[...document.images].filter(x=>!x.naturalWidth).map(x=>x.src),duplicate:ids.filter((x,i)=>ids.indexOf(x)!==i)};
   });
   if(data.width>width||data.h1!==1||data.broken.length||data.duplicate.length)issues.push({name,width,data});
   reports.push({name,width,documentWidth:data.width});
   if(name==='index'||width===390||width===1440)await page.screenshot({path:`tmp/qa/${name}-${width}.png`,fullPage:true});
  }
  await page.close();
 }
 const page=await browser.newPage({viewport:{width:390,height:844}});
 await page.goto('http://127.0.0.1:8765/');
 await page.getByRole('button',{name:'Abrir menú'}).click();
 if(!await page.locator('#menu-dialog').isVisible())issues.push('Menu not visible');
 await page.keyboard.press('Escape');
 if(await page.locator('#menu-dialog').isVisible())issues.push('Escape failed');
 if(!await page.getByRole('button',{name:'Abrir menú'}).evaluate(el=>el===document.activeElement))issues.push('Focus restoration failed');
 await page.goto('http://127.0.0.1:8765/test-longevidad.html');
 await page.locator('#test-next').click();
 if(!await page.locator('#test-error').isVisible())issues.push('Test validation failed');
 await page.getByLabel('Sueño y descanso',{exact:true}).check();await page.locator('#test-next').click();await page.locator('#test-back').click();
 if(!await page.getByLabel('Sueño y descanso',{exact:true}).isChecked())issues.push('Test preservation failed');
 await page.locator('#test-next').click();await page.getByLabel('Conocer al equipo',{exact:true}).check();await page.locator('#test-next').click();await page.getByLabel('Los canales de contacto',{exact:true}).check();await page.locator('#test-next').click();
 if(!await page.locator('#test-result').isVisible())issues.push('Result failed');
 await page.locator('#test-reset').click();
 if(await page.locator('input:checked').count())issues.push('Reset failed');
 await page.goto('http://127.0.0.1:8765/preguntas-frecuentes.html');await page.locator('summary').first().click();if(await page.locator('details').first().getAttribute('open')===null)issues.push('Accordion failed');
 await page.goto('http://127.0.0.1:8765/');
 await page.evaluate(async()=>{for(let y=0;y<document.body.scrollHeight;y+=600){scrollTo(0,y);await new Promise(r=>setTimeout(r,30));}});
 await page.emulateMedia({reducedMotion:'reduce'});
 if(await page.locator('.motion-ready:not(.is-visible)').count())issues.push('Reduced motion failed');
 const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});await nojs.goto('http://127.0.0.1:8765/');if(!await nojs.locator('h1').isVisible())issues.push('No JS content failed');
 fs.writeFileSync('tmp/qa/frontend-report.json',JSON.stringify({issues,reports},null,2));console.log(JSON.stringify({issues,checks:reports.length}));await browser.close();
})();
