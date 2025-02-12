import axios from 'axios';

const options = {
  method: 'GET',
  url: 'https://mailok-email-validation.p.rapidapi.com/verify',
  params: {
    email: 'example.user@gmail.com'
  },
  headers: {
    'x-rapidapi-key': '526a5984d5mshfdb3c0afb18bdb8p15553fjsn7f3cdf8e4bbf',
    'x-rapidapi-host': 'mailok-email-validation.p.rapidapi.com'
  }
};

try {
	const response = await axios.request(options);
	console.log(response.data);
} catch (error) {
	console.error(error);
}