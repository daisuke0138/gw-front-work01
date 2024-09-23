import Footer from '@/components/Footer'
import Header from '@/components/Header'
import Logout from '@/components/Logout'
import React from 'react'

const logout = () => {
  return (
      <div>
        <Header />
        <Logout />
        <Footer />
      </div>
  )
}

export default logout