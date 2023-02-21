import { useEffect } from 'preact/hooks'
import faunadb, { StreamEventFields } from 'faunadb/?target=es2022'
import { useSignal } from '@preact/signals'

export default ({ market, secret }: { market: string; secret: string }) => {
  const markets = useSignal('')
  const { query: q } = faunadb

  const client = new faunadb.Client({
    secret,
    domain: 'db.us.fauna.com', // Adjust if you are using Region Groups
  })

  const docRef = q.Ref(q.Collection('Market'), market)

  function reportDocument(e: any) {
    console.log(e)
    const data = ('action' in e) ? e['document'].data : e.data
    markets.value = JSON.stringify(data)
  }

  let stream: faunadb.Subscription<faunadb.SubscriptionEventHandlers>

  const startStreamDocument = () => {
    stream = client.stream.document(docRef)
      .on('snapshot', (snapshot) => {
        reportDocument(snapshot)
      })
      .on('version', (version) => {
        reportDocument(version)
      })
      .on('error', (error) => {
        console.log('Error:', error)
        stream.close()
        setTimeout(startStreamDocument, 1000)
      })
      .start()
  }

  useEffect(() => {
    startStreamDocument()
    return () => stream.close()
  }, [])

  return (
    <>
      Markets: {markets.value}
    </>
  )
}
