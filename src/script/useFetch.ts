import {useState, useEffect} from 'react';

export const useFetch = (url: string) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const abortController = new AbortController();

    setTimeout(() => {
      fetch(url, {signal: abortController.signal})
        .then(response => {
          if (!response.ok) {
            throw Error('Não foi possivel obter os dados.');
          }
          return response.json();
        })
        .then(json => {
          setData(json);
          setLoading(false);
          setError(null);
        })
        .catch(err => {
          if (err.name === 'AbortError') {
            console.log('fetch aborted');
          } else {
            setLoading(false);
            setError(err.message);
          }
        });
    }, 1000);
    return () => abortController.abort();
  }, [url]);
  return {data, loading, error};
};
