import socket from '../Functions/Users'
import Peer from 'simple-peer'

let peers;

if (window.localhost.hash === '#init') {
  const peer = new Peer({
    initiator: true,
    trickle: false,
  })

  peer.on('signal', (data) => {
    console.log('SIGNAL:', data)
    socket.emit('airdropOffer', data)
  })
  peers = peer

}
//listen to socket
socket.on('backOffer', (data) => {
  const peer = new Peer({
    initiator: false,
    trickle: false,
  })

  peer.on('signal', data => {
    console.log(`I think it is answer`, data)
    socket.emit('airdropAnswer', data)
  })
  peer.signal(data)

  peers = peer
})


socket.on('airdropBackAnswer', data => {
  peers.signal(data)
})
//listen for data changes

export default peers

// let buffer = new Blob(array, {
//   type: parsed.type
// })
// let url = window.URL.createObjectURL(buffer)
// console.log('URL:', url)
// let a
// a = document.createElement('a')
// a.href = url
// a.download = `airdrop`
// document.body.appendChild(a)
// a.style = 'display: none'
// a.click()

//TODO:Testing Code
// let array = []
// let original = '',
//   type
// peer.on('data', data => {
//   const parsed = JSON.parse(data)
//   if (parsed.type === 'text/plain') {
//     console.log('Text message', parsed)
//   } else {
//     // Ripme(parsed)
//     console.log(data)
//     return

//     array = [...array, parsed]
//     let news = array.filter((data, i) => {
//       let file = data.file !== undefined ? data.file : ''

//       let only = file.split(`data:${data.type};base64,`)
//       let base = only[1]

//       return base
//     })
//     console.log(news.length === parsed.chunk, news.length, parsed.chunk)
//     if (news.length === parsed.chunk) {
//       news.map((data, i) => {
//         let file = data.file !== undefined ? data.file : ''
//         let only = file.split(`data:${data.type};base64,`)
//         let base = only[1]
//         original += base

//         return original
//       })
//       console.log(
//         news.length === parsed.chunk && news.length > 0 && parsed.chunk > 0
//       )
//       console.log(parsed)

//       let blob = b64toBlob(original, parsed.type)
//       console.log(blob)

//       let url = window.URL.createObjectURL(blob)
//       console.log('URL:', url)
//       let a
//       a = document.createElement('a')
//       a.href = url
//       a.download = `airdrop`
//       document.body.appendChild(a)
//       a.style = 'display: none'
//       a.click()
//       array = []
//       original = ''
//     } else {
//       console.log('im here')
//     }
//   }
// })
