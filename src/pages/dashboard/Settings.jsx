import React from 'react'
import Notification from '../../components/settings/Notification'
import HelpSection from '../../components/settings/HelpSection'

const Settings = () => {
  return (
    <div className='flex md:flex-row flex-col items-start p-4 gap-4 '>
      <Notification/>
      <HelpSection/>
    </div>
  )
}

export default Settings
