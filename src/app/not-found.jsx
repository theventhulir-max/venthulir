import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '70vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '40px 20px',
      backgroundColor: '#f9f7f2',
      color: '#15221b'
    }}>
      <div style={{
        fontFamily: "'Cinzel', Georgia, serif",
        fontSize: '72px',
        fontWeight: '900',
        color: '#0f3d2a',
        marginBottom: '10px'
      }}>
        404
      </div>
      <h1 style={{
        fontFamily: "'Cinzel', Georgia, serif",
        fontSize: '24px',
        color: '#0f3d2a',
        marginBottom: '12px'
      }}>
        Page Not Found
      </h1>
      <p style={{
        fontSize: '15px',
        color: '#55695d',
        maxWidth: '420px',
        lineHeight: '1.6',
        marginBottom: '28px'
      }}>
        The organic harvest or page you are looking for does not exist or has been relocated.
      </p>
      <Link 
        href="/home"
        style={{
          background: '#0f3d2a',
          color: '#ffffff',
          padding: '12px 28px',
          borderRadius: '10px',
          fontSize: '14px',
          fontWeight: '700',
          textDecoration: 'none',
          boxShadow: '0 4px 12px rgba(15, 61, 42, 0.2)'
        }}
      >
        Return to Storefront
      </Link>
    </div>
  );
}
