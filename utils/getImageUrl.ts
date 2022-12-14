import axios from 'axios';
export default async function getImageUrl(url: string) {
  
  const {status} = await axios.get(url);
  if (status === 200) {
    return url;
  } else {
    return "https://cdn-icons-png.flaticon.com/512/438/438450.png";
  }
}