import { Button } from '@/components/ui/button'
import Link from 'next/link'

const CircleWithNumber = ({ number }: { number: number }) => {
  return (
    <div className="flex items-center justify-center w-6 h-6 p-4 bg-white border border-black rounded-full ">
      <p className="text-lg font-bold text-black">{number}</p>
    </div>
  )
}

const HowToGetStarted = () => {
  return (
    <section className="flex flex-col items-center gap-8 px-4 py-16 rounded-xl bg-dark">
      <h2 className="text-3xl font-bold text-center text-white">
        How do I get started?
      </h2>
      <div className="flex flex-col items-start gap-8 text-white lg:flex-row lg:px-32">
        <div className="flex flex-1 gap-4 lg:rounded-xl lg:bg-white lg:px-4 lg:pb-16 lg:pt-8 lg:shadow-2xl">
          <CircleWithNumber number={1} />
          <div>
            <p className="text-xl font-bold">Make an account</p>
            <p className="text-md">
              Sign up with your details easy-peasy
              <br />
              <br className="hidden lg:block" />
              <br className="hidden lg:block" />
            </p>
          </div>
        </div>
        <div className="flex flex-1 gap-4 lg:rounded-xl lg:bg-white lg:px-4 lg:pb-16 lg:pt-8 lg:shadow-2xl">
          <CircleWithNumber number={2} />
          <div>
            <p className="text-xl font-bold">Create your listing for free</p>
            <p className="w-4/5 text-md">
              With Taper, it is entirely free to showcase your barber brand
              <br />
              <br className="hidden lg:block" />
            </p>
          </div>
        </div>
        <div className="flex flex-1 gap-4 lg:rounded-xl lg:bg-white lg:px-4 lg:pb-16 lg:pt-8 lg:shadow-2xl">
          <CircleWithNumber number={3} />
          <div>
            <p className="text-xl font-bold">
              Showcase your brand to the world
            </p>
            <p className="w-4/5 text-md">
              Your listing is live! Your brand is now live for the world to see!
            </p>
          </div>
        </div>
      </div>
      <Button className="text-sm font-bold bg-purple-500 rounded-full" asChild>
        <Link href={'#main'}>Create your profile</Link>
      </Button>
    </section>
  )
}

export default HowToGetStarted
