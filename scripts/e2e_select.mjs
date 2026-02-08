import fs from 'fs';
import path from 'path';
import { firefox } from 'playwright';

const BASE = process.env.E2E_BASE_URL || 'http://localhost:3024';
const TOKEN = process.env.E2E_SESSION_TOKEN || process.env.E2E_SESSION || '';
const OUT = '/tmp/admin_after_select.png';

async function run(){
  if(!TOKEN) {
    console.error('E2E_SESSION_TOKEN is not set');
    process.exit(2);
  }

  const browser = await firefox.launch({ headless: true });
  const context = await browser.newContext();

  await context.addCookies([{
    name: 'app_session_id',
    value: TOKEN,
    domain: 'localhost',
    path: '/',
    httpOnly: false,
    sameSite: 'Lax',
  }]);

  const page = await context.newPage();
  const logs = [];
  page.on('console', msg => {
    try{
      const text = msg.text();
      const line = `PAGE [${msg.type()}]: ${text}`;
      logs.push(line);
      console.log(line);
    }catch(e){}
  });
  page.on('pageerror', err => {
    const line = `PAGE ERROR: ${err.message}\n${err.stack}`;
    logs.push(line);
    console.error(line);
  });

  console.log('Navigating to', BASE + '/login');
  await page.goto(BASE + '/login', { waitUntil: 'networkidle' });

  const tenantSelectors = [
    'text=demo-store',
    'text=Loja Demo',
    '[data-subdomain="demo-store"]',
    'text=Loja Teste E2E',
    'article:has-text("demo-store")',
  ];

  let clickedTenant = false;
  for(const sel of tenantSelectors){
    const loc = page.locator(sel);
    const count = await loc.count();
    if(count>0){
      console.log('Found tenant selector:', sel, 'count=', count);
      await loc.first().click().catch(()=>{});
      clickedTenant = true;
      break;
    }
  }

  if(!clickedTenant){
    console.log('Tenant not found by text selectors, attempting to click first tenant card');
    const cards = page.locator('[role="button"], .tenant-card, .card');
    if(await cards.count()>0) {
      await cards.first().click().catch(()=>{});
    }
  }

  await page.waitForTimeout(1200);

  const profileBtnSelectors = [
    'text=Selecionar',
    'text=Entrar',
    'text=Select',
    'button:has-text("Selecionar")',
    'button:has-text("Entrar")',
  ];
  let clickedProfile=false;
  for(const s of profileBtnSelectors){
    const l = page.locator(s);
    if(await l.count()>0){
      console.log('Clicking profile button:', s);
      await l.first().click().catch(()=>{});
      clickedProfile = true;
      break;
    }
  }

  if(!clickedProfile){
    console.log('Profile button not found, clicking first button in page');
    const btns = page.locator('button');
    if(await btns.count()>0) await btns.first().click().catch(()=>{});
  }

  try{
    await page.waitForURL('**/admin**', { timeout: 5000 });
  }catch(e){
    console.log('Did not navigate to /admin within timeout, current URL:', page.url());
  }

  await page.screenshot({ path: OUT, fullPage: true });
  console.log('Saved screenshot to', OUT);

  try{
    fs.writeFileSync('/tmp/e2e_select_logs.txt', logs.join('\n\n'));
    console.log('Wrote logs to /tmp/e2e_select_logs.txt');
  }catch(e){
    console.warn('Failed to write logs file', e);
  }

  // attempt to read ErrorBoundary stack from page if present
  try{
    const stack = await page.evaluate(()=>{
      const pre = document.querySelector('pre');
      return pre ? (pre.textContent || '').slice(0, 20000) : '';
    });
    if(stack && stack.length>0){
      fs.appendFileSync('/tmp/e2e_select_logs.txt', '\n\n--- ErrorBoundary stack ---\n' + stack);
      console.log('Appended ErrorBoundary stack to logs');
    }
  }catch(e){
    console.warn('Failed to extract ErrorBoundary stack', e);
  }

  await browser.close();
}

run().catch(err=>{
  console.error(err);
  process.exit(1);
});
