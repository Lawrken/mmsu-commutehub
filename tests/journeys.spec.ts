import {test,expect} from '@playwright/test';

test('navigation, trip completion, reports and return route persist',async({page})=>{
 await page.route('**/tile.openstreetmap.org/**',route=>route.abort());
 await page.goto('/'); await expect(page.getByRole('heading',{name:'Plan your campus commute.'})).toBeVisible();
 await page.getByRole('link',{name:'Plan a trip'}).first().click(); await expect(page).toHaveURL(/\/routes/);
 await expect(page.getByRole('heading',{name:'Available routes'})).toBeVisible();
 await expect(page.getByLabel('Approximate schematic route from Laoag City Terminal to MMSU Batac Main Campus')).toBeVisible();
 await page.getByRole('link',{name:'View route'}).first().click(); await expect(page.getByRole('heading',{name:'Journey overview'})).toBeVisible();
 await page.getByRole('button',{name:'Start trip'}).click(); await expect(page).toHaveURL(/\/trips/);
 for(const name of ['Continue to Boarded','Continue to Riding','Continue to Arrived','Complete trip'])await page.getByRole('button',{name}).click();
 await expect(page.getByText('1 completed trip')).toBeVisible(); await page.reload(); await expect(page.getByText('1 completed trip')).toBeVisible();
 await page.goto('/community'); await page.getByRole('button',{name:'Share a report'}).click(); await page.getByLabel('Details (optional)').fill('Browser test observation'); await page.getByRole('button',{name:'Post report'}).click(); await expect(page.getByText('Browser test observation')).toBeVisible(); await page.reload(); await expect(page.getByText('Browser test observation')).toBeVisible();
 await page.goto('/routes'); await page.getByLabel('Starting point',{exact:true}).selectOption('MMSU Batac Main Campus'); await page.getByLabel('Destination',{exact:true}).selectOption('Laoag City Terminal'); await page.getByRole('link',{name:'View route'}).first().click(); await page.getByRole('button',{name:'Start trip'}).click();
 for(const name of ['Continue to Boarded','Continue to Riding','Continue to Arrived','Complete trip'])await page.getByRole('button',{name}).click(); await expect(page.getByText('2 completed trips')).toBeVisible();
 await page.goto('/profile'); await expect(page.getByText('Reports shared')).toBeVisible();
});

test('filters, route return navigation and tablet layout',async({page})=>{
 await page.setViewportSize({width:768,height:1024});await page.route('**/tile.openstreetmap.org/**',route=>route.abort());
 await page.goto('/routes');await page.getByLabel('Sort by').selectOption('Lowest fare');await expect(page.locator('article').first().getByRole('heading',{name:'Demo City Connector'})).toBeVisible();
 await page.getByRole('link',{name:'View route'}).first().click();await page.getByRole('link',{name:'Back to routes'}).click();await expect(page.getByLabel('Sort by')).toHaveValue('Lowest fare');
 await page.goto('/alerts');await page.getByLabel('Severity').selectOption('High');await expect(page.getByRole('heading',{name:'Terminal crowding'})).toBeVisible();await expect(page.getByRole('heading',{name:'Busy corridor'})).toHaveCount(0);
 await page.goto('/community');await page.getByLabel('Category',{exact:true}).selectOption('Service interruption');await expect(page.getByRole('heading',{name:'No reports match these filters'})).toBeVisible();
 await page.goto('/departure-planner');await page.getByLabel('Class starts').fill('');await expect(page.getByText('Enter a valid class time.')).toBeVisible();
 expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth)).toBeTruthy();
});

test('separate pages, invalid routes and mobile navigation',async({page})=>{
 await page.setViewportSize({width:390,height:844});
 for(const [path,heading] of [['/','Plan your campus commute.'],['/routes','Routes'],['/departure-planner','Departure planner'],['/trips','Trips'],['/community','Community reports'],['/alerts','Alerts'],['/profile','Profile']]){await page.goto(path);await expect(page.getByRole('heading',{name:heading,exact:true})).toBeVisible();await page.reload();await expect(page.getByRole('heading',{name:heading,exact:true})).toBeVisible();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=window.innerWidth),`${path} should fit mobile width`).toBeTruthy()}
 await page.getByRole('button',{name:'More',exact:true}).click(); await expect(page.getByRole('navigation',{name:'More pages'}).getByRole('link',{name:'Alerts'})).toBeVisible();
 await page.goto('/routes');await page.getByLabel('Starting point',{exact:true}).selectOption('MMSU Laoag Campus');await page.getByLabel('Destination',{exact:true}).selectOption('MMSU Dingras Campus');await expect(page.getByRole('heading',{name:'No demo routes available for these locations'})).toBeVisible();
 await page.goto('/departure-planner');await page.getByLabel('Class starts').fill('00:20');await expect(page.getByText('Leave the previous day')).toBeVisible();
});

test('migrates existing profile and reports',async({page})=>{
 await page.addInitScript(()=>localStorage.setItem('mmsu-commutehub-v1',JSON.stringify({version:1,name:'Test Commuter',campus:'MMSU Batac Main Campus',favorites:['green'],reports:[{id:'old-report',category:'Crowded vehicle',route:'Demo Green Line 01',location:'Laoag City Terminal',description:'Previous observation',time:'Demo sample',origin:'Community report'}],trips:[],active:null})));
 await page.goto('/profile');await expect(page.getByLabel('Display name')).toHaveValue('Test Commuter');await page.goto('/community');await expect(page.getByText('Previous observation')).toBeVisible();await page.reload();await expect(page.getByText('Previous observation')).toBeVisible();
});

test('keyboard navigation, browser history and dialog focus',async({page})=>{
 await page.goto('/');await page.getByRole('heading',{name:'Plan your campus commute.'}).waitFor();
 await page.keyboard.press('Tab');await page.keyboard.press('Tab');await page.keyboard.press('Tab');await expect(page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Routes'})).toBeFocused();
 await page.keyboard.press('Enter');await expect(page).toHaveURL(/\/routes/);await page.goBack();await expect(page).toHaveURL('http://localhost:3000/');await page.goForward();await expect(page).toHaveURL(/\/routes/);
 await page.goto('/community');const open=page.getByRole('button',{name:'Share a report'});await open.click();await expect(page.getByRole('dialog')).toBeVisible();await page.keyboard.press('Escape');await expect(page.getByRole('dialog')).toHaveCount(0);await expect(open).toBeFocused();
});
