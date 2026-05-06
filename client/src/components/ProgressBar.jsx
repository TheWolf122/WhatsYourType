export default function ProgressBar({ seen, total }) {
  const pct = total > 0 ? (seen / total) * 100 : 0;
  return (
    <div style={{ margin: '12px 0' }}>
      <div style={{ fontSize: '0.8rem', marginBottom: '4px', color: '#666' }}>
        {seen} / {total} seen
      </div>
      <div style={{
        height: '6px',
        background: '#e0e0e0',
        borderRadius: '3px',
        overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: 'var(--color-primary)',
          borderRadius: '3px',
          transition: 'width 200ms ease',
        }} />
      </div>
    </div>
  );
}
