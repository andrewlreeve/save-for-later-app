import React, { useEffect, useState } from 'react';
import { Tweet } from 'react-twitter-widgets';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';

// Constants
const TEST_TWEETS = [
  "1457342491477303297",
  "1460679770396520448",
  "1458896267719892998",
]
const TWITTER_HANDLE = 'andrewlreeve';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [tweetIds, SetTweetIds] = useState([]);
  const checkIfWalletIsConnected = async () => {
    try {
      const { solana } = window;
      if (solana) {
        if (solana.isPhantom) {
          console.log('Phantom wallet found');

          const response = await solana.connect({ onlyIfTrusted: true });
          console.log('Connected with Public Key: ', response.publicKey.toString());
          setWalletAddress(response.publicKey.toString());
        }
      } else {
        alert('Phantom Solana Wallet not found!. Get a Phantom Wallet to use this app.');
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWallet = async () => {
    const { solana } = window;
    if (solana) {
      const response = await solana.connect();
      console.log('Connected with Public Key: ', response.publicKey.toString());
      setWalletAddress(response.publicKey.toStrin);
    }
  };

  const sendTweetId = async () => {
    if (inputValue.length > 0) {
      console.log('Tweet ID: ', inputValue);
    } else {
      console.log('Empty input. Try again.')
    }
  }

  const onInputChange = (event) => {
    const { value } = event.target;
    setInputValue(value);
  }

  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
      Connect to Wallet
    </button>
  );

  const renderConnectedContainer = () => (
    <div className="connected-container">
      <form
        onSubmit={(event) => {
          event.preventDefault();
          sendTweetId();
        }}
      >
        <input type="text"
        placeholder="Enter Tweet ID"
        value={inputValue}
        onChange={onInputChange}
        />
        <button type="submit" className="cta-button submit-tweet-button">Submit</button>
      </form>
      <div className="tweet-grid">
        {tweetIds.map(tweetId => (
          <div className="tweet-item" key={tweetId}>
           <Tweet tweetId={tweetId} options={{ theme: "dark", width: '400px'}}/>
          </div>
        ))}
      </div>
    </div>
  )

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected();
    };
    window.addEventListener('load', onLoad);
    return () => window.removeEventListener('load', onLoad);
  }, []);

  useEffect(() => {
    if (walletAddress) {
      console.log('Fetching Tweet IDs...')
      // [TODO] call Solana Program
      SetTweetIds(TEST_TWEETS);
    }
  }, [walletAddress]);

  return (
    <div className="App">
      <div className={walletAddress ? 'authed-container' : 'container'}>
        <div className="header-container">
          <p className="header">Save For Later</p>
          <p className="sub-text">
            A resource of saved tweets on Defi yield strategies. Tweet IDs safely stored on the Solana blockchain.
          </p>
          {!walletAddress && renderNotConnectedContainer()}
          {walletAddress && renderConnectedContainer()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`Built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
