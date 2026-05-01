import { useState, useEffect } from 'react';

export function useHistory(minutes = 60, host = 'local') {
  const [data, setData]       = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/system/history?host=${host}&minutes=${minutes}`)
      .then(r => r.json())
      .then(rows => {
        setData(rows.map(r => ({
          ts:          r.ts,
          cpu:         r.cpu,
          memPercent:  r.mem_total > 0 ? parseFloat(((r.mem_used / r.mem_total) * 100).toFixed(1)) : 0,
          diskPercent: r.disk_total > 0 ? parseFloat(((r.disk_used / r.disk_total) * 100).toFixed(1)) : 0,
        })));
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [minutes, host]);

  return { data, loading };
}
