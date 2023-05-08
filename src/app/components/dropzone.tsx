'use client';

import './../globals.css'
import { ClipboardEvent } from 'react'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function DropZone() {


  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    console.log("Pasted Something");

    const items = e.clipboardData.items;
    
    console.log(items.length);

    for(let i = 0; i<items.length; i+=1) {
        console.log(items[i]);
    }

    
    }

  return (
    <div onPaste={handlePaste} className="m-6 p-6 w-96 h-max border-black rounded-md border-2 border-dashed">
        <h1> Hello </h1>
    </div>
  )
}
