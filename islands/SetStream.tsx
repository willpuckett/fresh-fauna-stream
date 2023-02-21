import { useEffect } from 'preact/hooks'
// this is running on the client (eventually) so make sure to specify a non-deno target
import faunadb, { StreamEventFields } from 'faunadb/?target=es2022'
import { useSignal } from '@preact/signals'

export default ({ market, secret }: { market: string; secret: string }) => {
  const markets = useSignal('')

  const { query: q } = faunadb
  const client = new faunadb.Client({
    secret,
    domain: 'db.us.fauna.com', // Adjust if you are using Region Groups
  })

  // const setRef = q.Documents(q.Collection('Market'))
  const setRef = q.Match(q.Index('propertiesByMarket'), market)

  function reportSet(e: any) {
    console.log(e)
    markets.value = JSON.stringify(e)
  }

  let stream: faunadb.Subscription<faunadb.SubscriptionEventHandlers>

  // Define the stream fields to include
  const streamOptions: { fields: StreamEventFields[] } = {
    fields: ['action', 'document'],
  }

  const startStreamSet = () => {
    stream = client.stream(setRef, streamOptions)
      .on('start', (start) => {
        reportSet(start)
        // Add FQL or graphql-request here to get initial data... something like:
        //   const { data } = await client.query<{ data: IProperty[] }>(q.Call('propertiesByMarket', market))
        //   properties.value = [...data]
      })
      .on('set', (set) => {
        reportSet(set)
        // Process set changes here... the only two actions for a set are 'add' and 'remove' Something like:
        //   @ts-ignore: wonky objects
        const id: string = set.document.ref.value.id
        if (set.action === 'add') {
          //       const { data } = await client.query<{ data: IProperty }>(q.Get(q.Ref(q.Collection('Property'), id)))
          //       markets.value = [...properties.value, data]
        } else if (set.action === 'remove') {
          //       markets.value = properties.value.filter((p) => p.zpid !== id)
        }
      })
      .on('error', (error) => {
        console.log('Error:', error)
        stream.close()
        setTimeout(startStreamSet, 1000)
      })
      .start()
  }

  useEffect(() => {
    startStreamSet()
    return () => stream.close()
  }, [])

  return (
    <>
      Markets: {markets.value}
    </>
  )
}
