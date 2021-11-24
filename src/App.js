import React, { useEffect, useState } from 'react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, Provider, web3, BN } from '@project-serum/anchor';
import idl from './idl.json';
import kp from './keypair.json';
import { Tweet } from 'react-twitter-widgets';
import twitterLogo from './assets/twitter-logo.svg';
import './App.css';

const { SystemProgram } = web3;
const arr = Object.values(kp._keypair.secretKey);
const secret = new Uint8Array(arr);
const baseAccount = web3.Keypair.fromSecretKey(secret);
const programID = new PublicKey(idl.metadata.address);
const network = clusterApiUrl('devnet');
const opts = {
  preflightCommitment: "processed"
}

// Constants
const TWITTER_HANDLE = 'andrewlreeve';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState('');
  const [tweetIds, setTweetIds] = useState(["2343423434243"]);
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

  const onInputChange = (event) => {
    const { value } = event.target;
    setInputValue(value);
  }

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection, window.solana, opts.preflightCommitment,
    );
    return provider
  }

  const createTweetAccount = async () => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      console.log("ping");
      await program.rpc.startStuffOff({
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
          systemProgram: SystemProgram.programId,
        },
        signers: [baseAccount]
      });
      console.log("Created a new BaseAccount with address: ", baseAccount.publicKey.toString());
      await getTweets();
    } catch(error) {
      console.log("Error creating BaseAccount account: ", error);
    }
  }

  const convertBigNumberToString = (tweetIds) => {
    return tweetIds.map(tweet => {
      return tweet.tweetId.toString();
    })
  }

  const getTweets = async() => {
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);
      const account = await program.account.baseAccount.fetch(baseAccount.publicKey);

      console.log("Got the account", account);
      console.log("TweetIds", convertBigNumberToString(account.tweetIds));
      setTweetIds(convertBigNumberToString(account.tweetIds))
    } catch (error) {
      console.log("Error in getTweets: ", error);
      setTweetIds(null); 
    }
  }

  const sendTweetId = async () => {
    if (inputValue.length === 0) {
      console.log("No Tweet ID given!");
      return
    }

    console.log("Tweet ID: ", inputValue);
    try {
      const provider = getProvider();
      const program = new Program(idl, programID, provider);

      await program.rpc.addTweetId(new BN(inputValue.toString()), {
        accounts: {
          baseAccount: baseAccount.publicKey,
          user: provider.wallet.publicKey,
        },
      })
      console.log("Tweet ID successfully sent to program ", inputValue);

      await getTweets();
    } catch(error) {
      console.log("Error sending Tweet:", error);
    }
  };

  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
      Connect to Wallet
    </button>
  );

  const renderConnectedContainer = () => {
    if (tweetIds === null) {
      return (
        <div className="connected-container">
          <button className="cta-button submit-tweet-button" onClick={createTweetAccount}>
            Do One-Time Initialization For Tweet Program Account
          </button>
        </div>
      )
    } else { 
      return (
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
            {tweetIds.map((item, index) => (
              <div className="tweet-item" key={index}>
                <Tweet tweetId={item} options={{ theme: "dark", width: '400px'}}/>
              </div>
            ))}
          </div>
        </div>
      )
    }
  }



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
      getTweets();
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
