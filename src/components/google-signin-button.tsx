import { Button } from '@/components/ui/button'

export const GoogleSignInButton = () => {
  return (
    <a href={`${process.env.NEXT_PUBLIC_SERVER_URL}/api/oauth2/authorize/google`}>
      <Button variant="outline" className="w-full">
        {/* আপনি এখানে গুগলের আইকনও ব্যবহার করতে পারেন */}
        Sign In with Google
      </Button>
    </a>
  )
}