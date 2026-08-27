import Image from 'next/image';
import Link from 'next/link';

export default function NotFound() {
  return (
    <main className='not-found-page' id='main-content'>
      <div className='not-found-card'>
        <Image
          className='not-found-logo'
          src='/api-publishers-logo-navbar.png'
          alt='Association of Publishers in India'
          width={2074}
          height={523}
          priority
        />
        <p className='not-found-code'>Page not found</p>
        <h1>That page isn&apos;t here.</h1>
        <p>
          The link may be out of date. Return to the API Excellence Awards nomination page to
          review the categories or start a nomination.
        </p>
        <Link className='button button-dark' href='/'>
          Return to nominations
        </Link>
      </div>
    </main>
  );
}
