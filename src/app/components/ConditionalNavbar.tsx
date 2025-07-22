'use client';

import { usePathname } from 'next/navigation';
import Navbar from './Navabar/Navbar';

export default function ConditionalNavbar() {
  const pathname = usePathname();
  
  // Show navbar only on billing-related pages
  const showNavbar = pathname === '/create-bill' || pathname === '/edit-invoice';
  
  if (!showNavbar) {
    return null;
  }
  
  return <Navbar />;
}
