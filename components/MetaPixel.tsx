import Script from 'next/script';

// Meta Pixel for the nomination funnel. The ID is a public identifier, so it
// lives here rather than in an env var: a wrong or missing value at build time
// would silently send events to the wrong account.
export const metaPixelId = '1723877628851289';

// Meta's base snippet, verbatim apart from the ID being interpolated.
const baseCode = `!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${metaPixelId}');
fbq('track', 'PageView');`;

export default function MetaPixel() {
  return (
    <>
      {/* afterInteractive is the documented strategy for tag managers and
          analytics: loaded early, but never ahead of first-party code. */}
      <Script id='meta-pixel' strategy='afterInteractive'>
        {baseCode}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element -- a tracking
            pixel must stay an unoptimised request to facebook.com. */}
        <img
          height='1'
          width='1'
          style={{ display: 'none' }}
          alt=''
          src={`https://www.facebook.com/tr?id=${metaPixelId}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
