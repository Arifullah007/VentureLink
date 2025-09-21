"use client"

import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState(false)

  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    checkIsMobile()
    window.addEventListener("resize", checkIsMobile)
    return () => window.removeEventListener("resize", checkIsMobile)
  }, [])

  // Only return the value on the client-side after mounting
  const [isClient, setIsClient] = React.useState(false);
  React.useEffect(() => {
      setIsClient(true);
  }, []);

  return isClient ? isMobile : false;
}
