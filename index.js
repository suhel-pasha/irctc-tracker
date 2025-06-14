import { launch } from 'puppeteer';

const bookingStatus = {

  '2025-05-06': [1,1],
  '2025-05-13': [0,1],
  '2025-05-20': [0,1],
  '2025-05-27': [1,1],
  '2025-06-03': [1,1],
  '2025-06-10': [1,1],
  '2025-06-17': [1,1],
  '2025-06-24': [0,1]

}

function getTuesdaysInNext60Days() {
  const tuesdays = [];
  const today = new Date();

  for (let i = 0; i <= 60; i++) {
    const date = new Date();
    date.setDate(today.getDate() + i);

    if (date.getDay() === 2) {
      const formatted = date.toLocaleDateString('en-CA');
      tuesdays.push(formatted);
    }
  }

  return tuesdays;
}


const getSeats = async (dateString) => {
  const date = dateString.replaceAll('-', '');
  const browser = await launch({
    args: [
      '--disable-notifications', // disables the popup prompt
    ],
  });

  const page = await browser.newPage();

  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  await page.setViewport({ width: 1280, height: 800 });

  await page.goto(`https://www.redbus.in/railways/travellerInfo?src=SBC&dst=SMET&doj=${date}&reDoj=&trainNo=16227&cls=SL&q=GN&train=Mys%20Tlgp%20Exp&index=3&avlS=Available&avlNo=38&isRE=0&isCluster=0&isAltDoj=0&realSrc=&realSrcName=&realDst=&realDstName=&dDate=&dTime=&aDate=&aTime=&didPopUp=0&isFc=true&fcOpted=false`);

  const selector = '.availability-data'; // Replace with your desired element

  await page.waitForSelector(selector);

  let text1 = await page.$eval(selector, el => el.textContent.trim());
  text1 = text1.substring(text1.indexOf("(SL)"));

  await page.goto(`https://www.redbus.in/railways/travellerInfo?src=SMET&dst=SBC&doj=${date}&reDoj=&trainNo=12090&cls=2S&q=GN&train=Janshatabdi%20Exp&index=1&avlS=Available&avlNo=1163&isRE=0&isCluster=0&isAltDoj=0&realSrc=&realSrcName=&realDst=&realDstName=&dDate=&dTime=&aDate=&aTime=&didPopUp=0&isFc=true&fcOpted=false`);

  await page.waitForSelector(selector);

  let text2 = await page.$eval(selector, el => el.textContent.trim());
  text2 = text2.substring(text2.indexOf("(2S)"));
  await browser.close();
  return `${dateString}: ${text2.padEnd(0, ' ')}${(bookingStatus[dateString]?.[0]? '(Booked)': '(Not booked)').padEnd(0, ' ')} ${text1.padEnd(0, ' ')}(${(bookingStatus[dateString]?.[1]? 'Booked': 'Not booked')})`;

};

const dates = getTuesdaysInNext60Days();
const arr = [];
for (const d of dates) {
  console.log(await getSeats(d));
}

