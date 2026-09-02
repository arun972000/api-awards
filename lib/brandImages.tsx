import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { awardDates } from '@/lib/awardContent';

let logoDataUrlPromise: Promise<string> | undefined;

export function getAwardLogoDataUrl() {
  logoDataUrlPromise ??= readFile(
    join(process.cwd(), 'public', 'new logo.jpg'),
  ).then((contents) => 'data:image/jpeg;base64,' + contents.toString('base64'));

  return logoDataUrlPromise;
}

export async function createBrandIcon(pixelSize: number) {
  const logoDataUrl = await getAwardLogoDataUrl();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: '#173b5e',
        }}
      >
        {/* ImageResponse requires a native image element for embedded data URLs. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoDataUrl}
          alt=''
          width={pixelSize}
          height={pixelSize}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>
    ),
    { width: pixelSize, height: pixelSize },
  );
}

export async function createSocialImage() {
  const logoDataUrl = await getAwardLogoDataUrl();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          padding: '58px 66px',
          color: '#ffffff',
          background: '#0d273f',
          fontFamily: 'Arial, sans-serif',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 30 }}>
          {/* ImageResponse requires a native image element for embedded data URLs. */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={logoDataUrl}
            alt=''
            width={168}
            height={168}
            style={{ width: 168, height: 168, objectFit: 'cover', borderRadius: 7 }}
          />
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <span style={{ color: '#b7c0c7', fontSize: 20, letterSpacing: 3 }}>
              FOUNDERS EDITION
            </span>
            <strong style={{ fontSize: 34 }}>API Excellence Awards 2026</strong>
          </div>
        </div>

        <div
          style={{
            maxWidth: 1000,
            marginTop: 34,
            fontSize: 58,
            fontWeight: 700,
            letterSpacing: -2,
            lineHeight: 1.08,
          }}
        >
          Nominate the people and work advancing Indian publishing.
        </div>

        <div
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginTop: 'auto',
            paddingTop: 24,
            borderTop: '1px solid rgba(255,255,255,0.24)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <span style={{ color: '#aeb7bf', fontSize: 18, letterSpacing: 2 }}>
              NOMINATIONS CLOSE
            </span>
            <strong style={{ fontSize: 30 }}>{awardDates.nominationsClose}</strong>
            <span style={{ color: '#aeb7bf', fontSize: 18 }}>
              {awardDates.nominationsCloseTime}
            </span>
          </div>
          <div
            style={{
              padding: '16px 24px',
              color: '#173b5e',
              background: '#ffffff',
              borderRadius: 4,
              fontSize: 19,
              fontWeight: 700,
              letterSpacing: 2,
            }}
          >
            NOMINATE NOW
          </div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
