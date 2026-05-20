import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { motion } from "motion/react"
export function DialogStickyFooter() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        {/* <Button variant="outline">Sticky Footer</Button> */}
        <motion.div
          layoutId="button"
          className="h-10 rounded-full bg-primary px-8 py-2 text-primary-foreground hover:bg-primary/90"
        >
          Sticky Footer
        </motion.div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Sticky Footer</DialogTitle>
          <DialogDescription>
            This dialog has a sticky footer that stays visible while the content
            scrolls.
          </DialogDescription>
        </DialogHeader>
        <div className="-mx-4 no-scrollbar max-h-[50vh] overflow-y-auto px-4">
          {Array.from({ length: 10 }).map((_, index) => (
            <p key={index} className="mb-4 leading-normal">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do
              eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut
              enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in
              reprehenderit in voluptate velit esse cillum dolore eu fugiat
              nulla pariatur. Excepteur sint occaecat cupidatat non proident,
              sunt in culpa qui officia deserunt mollit anim id est laborum.
            </p>
          ))}
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <motion.div
              layoutId="button"
              className="h-10 rounded-full bg-primary px-8 py-2 text-primary-foreground hover:bg-primary/90"
            >
              Close
            </motion.div>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
