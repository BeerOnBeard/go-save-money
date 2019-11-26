import React, { Component } from 'react';
import Papa from 'papaparse';
import { TransactionBuilder } from 'money-tracker';
import TransactionTable from './TransactionTable';
import LoadingDistractor from './LoadingDistractor';

/*
 * Form that takes a string CSV of transactions, parses it, and
 * returns a collection of rows. The header will be the first row.
 */
class TransactionParseForm extends Component {
  constructor(props){
    super(props);
    this.csvText = React.createRef();
    this.state = { transactions: undefined, isLoading: false };
  }

  handleChange(event) {
    var self = this;
    self.setState({ isLoading: true });
    event.preventDefault();
    Papa.parse(event.target.files[0], { complete: result => {
      let transactions = TransactionBuilder.build(result.data);
      self.setState({ transactions: transactions, isLoading: false });
    }});
  }

  upload(event) {
    var self = this;
    self.setState({ isLoading: true });
    event.preventDefault();
    fetch('http://localhost:8080/transactions/bulk', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ transactions: self.state.transactions })
    })
    .then(response => {
      self.setState({ isLoading: false });
      if (!response.ok) {
        console.error(response);
        throw response;
      }
    })
  }

  render() {
    return (
      <>
        <LoadingDistractor isActive={this.state.isLoading} />
        <input type="file" onChange={e => this.handleChange(e)} />
        <button
          disabled={this.state.transactions === undefined}
          onClick={e => this.upload(e)}
          >Upload</button>
        <TransactionTable data={this.state.transactions} />
      </>
    );
  }
}

export default TransactionParseForm;
