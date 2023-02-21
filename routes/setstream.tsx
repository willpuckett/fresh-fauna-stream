import Stream from '@/islands/SetStream.tsx'
import { Handlers, PageProps } from '$fresh/server.ts'

interface Data {
  secret: string
}

export const handler: Handlers = {
  GET(_req, ctx) {
    return ctx.render({
      secret: ctx.state.faunaKey,
    })
  },
}

export default ({ data }: PageProps<Data>) => (
  <Stream market={'356966794875895893'} secret={data.secret} />
)
