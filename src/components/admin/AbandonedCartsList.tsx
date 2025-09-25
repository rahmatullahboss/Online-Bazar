import React from 'react'
import { useRouter } from 'next/router'
import { Button } from '@/components/ui/button'
import { Eye, EyeOff } from 'lucide-react'
import { List } from 'payload/components/views/List'
import type { CollectionConfig } from 'payload/types'

interface Props {
  collection: CollectionConfig
}

export const AbandonedCartsList: React.FC<Props> = ({ collection }) => {
  const router = useRouter()
  const { showRecovered } = router.query
  const isShowingRecovered = showRecovered === 'true'

  const toggleShowRecovered = () => {
    const newQuery = { ...router.query }
    if (isShowingRecovered) {
      delete newQuery.showRecovered
    } else {
      newQuery.showRecovered = 'true'
    }
    router.push({
      pathname: router.pathname,
      query: newQuery,
    })
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Abandoned Carts</h1>
        <Button variant="outline" onClick={toggleShowRecovered}>
          {isShowingRecovered ? (
            <>
              <EyeOff className="w-4 h-4 mr-2" />
              Hide Recovered
            </>
          ) : (
            <>
              <Eye className="w-4 h-4 mr-2" />
              Show Recovered
            </>
          )}
        </Button>
      </div>
      <List collection={collection} />
    </div>
  )
}
