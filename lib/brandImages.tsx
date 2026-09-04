import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { awardDates } from '@/lib/awardContent';

const logoWidth = 612;
const logoHeight = 139;
let blueLogoDataUrlPromise: Promise<string> | undefined;
let whiteLogoDataUrlPromise: Promise<string> | undefined;

export function getBlueAwardLogoDataUrl() {
  blueLogoDataUrlPromise ??= readFile(
    join(process.cwd(), 'public', 'BLUE LOGO.png'),
  ).then((contents) => 'data:image/png;base64,' + contents.toString('base64'));

  return blueLogoDataUrlPromise;
}

export function getWhiteAwardLogoDataUrl() {
  whiteLogoDataUrlPromise ??= readFile(
    join(process.cwd(), 'public', 'WHITE LOGO.png'),
  ).then((contents) => 'data:image/png;base64,' + contents.toString('base64'));

  return whiteLogoDataUrlPromise;
}

export async function createBrandIcon(pixelSize: number) {
  const logoDataUrl = await getBlueAwardLogoDataUrl();
  const tileSize = Math.round(pixelSize * 0.84);
  const markSize = Math.round(pixelSize * 0.7);
  const scaledLogoWidth = Math.round(markSize * (logoWidth / logoHeight));

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#173b5e',
        }}
      >
        <div
          style={{
            width: tileSize,
            height: tileSize,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            background: '#ffffff',
            borderRadius: Math.round(pixelSize * 0.17),
          }}
        >
          <div
            style={{
              width: markSize,
              height: markSize,
              display: 'flex',
              overflow: 'hidden',
            }}
          >
            {/* ImageResponse requires a native image element for embedded data URLs. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoDataUrl}
              alt=''
              width={scaledLogoWidth}
              height={markSize}
              style={{
                width: scaledLogoWidth,
                height: markSize,
                objectFit: 'fill',
              }}
            />
          </div>
        </div>
      </div>
    ),
    { width: pixelSize, height: pixelSize },
  );
}

export async function createSocialImage() {
  const logoDataUrl = await getWhiteAwardLogoDataUrl();

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
        {/* ImageResponse requires a native image element for embedded data URLs. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoDataUrl}
          alt=''
          width={490}
          height={111}
          style={{ width: 490, height: 111, objectFit: 'contain' }}
        />

        <span style={{ marginTop: 22, color: '#b7c0c7', fontSize: 20, letterSpacing: 3 }}>
          FOUNDERS EDITION · 2026
        </span>

        <div
          style={{
            maxWidth: 1000,
            marginTop: 28,
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
