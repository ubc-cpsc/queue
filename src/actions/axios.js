import axiosBase from 'axios'
import { toast } from 'react-toastify'
import { useRouter } from 'next/router'

import { baseUrl } from '../util'

const axios = axiosBase.create({ baseURL: baseUrl })

const router = useRouter()

axios.interceptors.response.use(null, err => {
  if (err.response) {
    // Status code outside of 2xx
    if (err.response.status === 401) {
      router.replace('/login')
    } else {
      const { showErrorToast } = err.config
      if (showErrorToast === undefined || showErrorToast === true) {
        toast.error(err.response.data.message || 'Something went wrong')
      }
    }
  } else {
    // Something happened while setting up the request
    toast.error(err.message)
  }
  return Promise.reject(err)
})

export default axios
