import React, { Component } from "react";
import "./App.css";


class App extends Component {
    constructor(props) {
        super(props);
        this.state = { 
            UserCountry: "",
            UserCurrencyPerBigMac: 0,
            UserPPP: 0,
            UserBigMacsTheyCanBuy: 0,
            UserMoney: 0,
            UserDollarPrice:  0,            
            RandomCountry:0,
            RandomCountryNumOfBigMacs:0,
            RandomCountryLocalPrice: 0,
            RandomCountryMoneyAmount: 0,
            RandomCountryPPP: 0,
            ConversionRate: 0

        };
    }



    //Initial get to gather the ip location of the user and get the data for to populate the compoenets
    initialGetOfIpAndRandomCountry() {
        fetch("http://localhost:9000/testAPI")
            .then(res => res.text())
            .then(res =>
                this.setState({ 
                    UserCountry: JSON.parse(res).UserData.Country,
                    UserCurrencyPerBigMac:  JSON.parse(res).UserData['Local price'],
                    UserDollarPrice:  JSON.parse(res).UserData['Dollar price'],
                    UserPPP:  JSON.parse(res).UserData['Dollar PPP'],
                    RandomCountry: JSON.parse(res).RandomCountry.Country,
                    RandomCountryLocalPrice: JSON.parse(res).RandomCountry['Local price'],
                    RandomCountryPPP: JSON.parse(res).RandomCountry['Dollar PPP'],
                    RandomDollarPrice:  JSON.parse(res).RandomCountry['Dollar price'],
                    ConversionRate: JSON.parse(res).conversionRate
                   })
                 )
            .then(res =>{
                localStorage.setItem('UserCountry',this.state.UserCountry);
            })
            .catch(err => err);

    }


    //Get a new random country by clicking the button so we dont call the ip api every call
    getNewRandomCountry(){ 
        fetch("http://localhost:9000/testAPI/getRandomCountry?UserCountry="+localStorage.getItem('UserCountry')+"")
        .then(res => res.text())
        .then(res => {
            try{ 
                this.setState({ 

                    RandomCountry: JSON.parse(res).RandomCountry.Country,
                    RandomCountryLocalPrice: JSON.parse(res).RandomCountry['Local price'],
                    RandomCountryPPP: JSON.parse(res).RandomCountry['Dollar PPP'],
                    RandomDollarPrice:  JSON.parse(res).RandomCountry['Dollar price'],
                    ConversionRate: JSON.parse(res).conversionRate
                   });

                   let numOfMacsBought = this.state.UserMoney / this.state.UserCurrencyPerBigMac;
                   let conversion = this.state.ConversionRate;
                   let numOfRandomMacs = parseInt(numOfMacsBought * conversion);
                   let randomMoneyAmount = conversion * this.state.UserMoney;
                   this.setState( { 
                       UserBigMacsTheyCanBuy: parseInt(numOfMacsBought),
                       RandomCountryNumOfBigMacs: numOfRandomMacs,
                       RandomCountryMoneyAmount: randomMoneyAmount
           
                   })
            }
            catch(err) { 
                console.log(err);
            }
            
        })   
        .then(res =>{
            console.log(this.state);
            localStorage.setItem('UserCountry',this.state.UserCountry);
        })
        .catch(err => err);

       
    }

    //Take money input and update componenets according
    handelMoneyInput(e) { 
        let numOfMacsBought = e.target.value / this.state.UserCurrencyPerBigMac;
        let conversion = this.state.ConversionRate;
        let numOfRandomMacs = parseInt(numOfMacsBought * conversion);
        let randomMoneyAmount = conversion * e.target.value;
        this.setState( { 
            UserMoney: e.target.value,
            UserBigMacsTheyCanBuy: parseInt(numOfMacsBought),
            RandomCountryNumOfBigMacs: numOfRandomMacs,
            RandomCountryMoneyAmount: randomMoneyAmount

        })
    }

    componentDidMount() {


        this.initialGetOfIpAndRandomCountry();
       
    }

    render() {
        return (
            <div className="App">
            <br/>
                <h3>You are in {this.state.UserCountry}</h3>
                <div>Please Enter an amount of money in your local currency</div>
                <input value={this.state.userMoney} onChange={(e) => this.handelMoneyInput(e)} />
                <br/>
                <br/>
                <div>You could buy {this.state.UserBigMacsTheyCanBuy} Big Macs in your country</div>
                <div>Your Dollar Purchasing Parity (PPP) is {this.state.UserPPP}</div>
                <div>This is a simple lookup to the table</div>
                <br/>
                <button onClick={(e) => this.getNewRandomCountry()}>Change Random Country</button>
                <br/>
                <h3>Random Country: {this.state.RandomCountry}</h3>
                <div>You could buy {this.state.RandomCountryNumOfBigMacs} of Big Macs in {this.state.RandomCountry} with {this.state.UserMoney}</div>
                <div>Your {this.state.UserMoney} is worth about {this.state.RandomCountryMoneyAmount} in {this.state.RandomCountry}</div>
            </div>
        );
    }
}

export default App;
