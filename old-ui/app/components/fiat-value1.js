import React, { Component } from 'react'
import { formatBalance, countSignificantDecimals } from '../util'
import PropTypes from 'prop-types'
import { DAI_CODE, POA_SOKOL_CODE, XDC_TESTNET_CODE,XDC_CODE, GOERLI_TESTNET_CODE,XDC_DEVNET_CODE } from '../../../app/scripts/controllers/network/enums'

class FiatValue extends Component {

  constructor(props) {
    super(props)
    this.state = {
      conversionRate:0
    }
  }
  
  componentDidMount() {
   this.getconversionRate()
  }
  async getconversionRate () {
    return new Promise(async (resolve, reject) => {
     
      try {
          
        const response = await fetch("https://9bzlasmblf.execute-api.us-east-2.amazonaws.com/prod/getCoinMarketCap/USD",{method:"get"})
        const parsedResponse = await response.json()
        console.log(parsedResponse,"parsedResponse")
        if (parsedResponse && parsedResponse.responseData && parsedResponse.responseData.length) {
            this.setState({conversionRate:parsedResponse.responseData[0].price})
            resolve(parsedResponse.responseData[0].price)
          } else {
            reject()
          }
        
      } catch (error) {
        reject(error)
      }
    })
  }
  
  render = () => {
    const props = this.props
    let { conversionRate } = props
    const { currentCurrency, network } = props
    const isTestnet = parseInt(network) === POA_SOKOL_CODE || parseInt(network) === XDC_TESTNET_CODE || parseInt(network) === XDC_CODE || parseInt(network) === XDC_DEVNET_CODE || parseInt(network) === GOERLI_TESTNET_CODE
    const isDai = parseInt(network) === DAI_CODE
    if (isTestnet) {
      conversionRate = this.state.conversionRate
    } else if (isDai) {
      conversionRate = 1
    }
    const renderedCurrency = currentCurrency || ''

    const value = formatBalance(props.value, 6, undefined, props.network)

    if (value === 'None') return value
    const splitBalance = value.split(' ')

    const fiatTooltipNumber = Number(splitBalance[0]) * conversionRate
    const fiatDisplayNumber = fiatTooltipNumber.toFixed(countSignificantDecimals(fiatTooltipNumber, 2))

    const valueStyle = props.valueStyle ? props.valueStyle : {
      width: '100%',
      textAlign: 'right',
      fontSize: '12px',
      color: '#848484',
    }

    const dimStyle = props.dimStyle ? props.dimStyle : {
      color: '#8484884',
      marginLeft: '5px',
      fontSize: '12px',
    }

    return this.fiatDisplay(fiatDisplayNumber, valueStyle, dimStyle, renderedCurrency.toUpperCase())
  }

  fiatDisplay = (fiatDisplayNumber, valueStyle, dimStyle, fiatSuffix) => {

    if (fiatDisplayNumber !== 'N/A') {
      return (
        <div
          className="flex-row"
          style={{
            // alignItems: 'flex-end',
            // lineHeight: '14px',
            // textRendering: 'geometricPrecision',
            position: 'absolute',
            right: '58px',
            fontSize: 12,
            fontFamily: 'Nunito SemiBold',
            color: '#848484'
          }}
        >
          <div className="fiat-val" style={valueStyle}>{fiatDisplayNumber}</div>
          <div className="fiat-dim" style={dimStyle}>{fiatSuffix}</div>
        </div>
      )
    } else {
      return <div/>
    }
  }
}

FiatValue.propTypes = {
  conversionRate: PropTypes.number,
  currentCurrency: PropTypes.string,
  network: PropTypes.string,
}

module.exports = FiatValue
