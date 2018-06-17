import React, { Component } from 'react'
import './reports.css'
import ReactTable from 'react-table'
import 'react-table/react-table.css'
import axios from 'axios'

class Reports extends Component {
  constructor(props) {
    super(props)

    this.state = {
      error: null,
      reportData: null,
      report: 'stats.top10',
      categories: [],
      subcategories: [],
      category: null,
      subcategory: null,
      loading: true
    }
  }

  componentDidMount() {
    const { report } = this.props
    this.loadReport(`/${report}.json`)
    this.setState({report})
  }

  scoreCategory = (category) => {
    if (category === 'hour') {
      return 0
    } else if (category === 'day') {
      return 1
    } else if (category === 'week') {
      return 2
    } else if (category === 'month') {
      return 3
    } else if (category === 'year') {
      return 4
    }
  }

  categoryComparator = (a, b) => {
    return this.scoreCategory(a) - this.scoreCategory(b)
  }

  loadReport = async (name) => {
    try {
      const res = await axios.get(name)

      let categories
      let subcategories
      let category
      let reportData = {}
      if (this.state.report === 'stats') {
        categories = Object.keys(res.data)
        categories.forEach(key => {
          reportData[key] = res.data[key].reduce((result, value) => {
            result[value.date] = value.stats
            return result
          }, {})
        })

        if (this.state.category === null) {
          category = categories.length > 0 ? categories[0] : null
        } else {
          category = this.state.category
        }
        subcategories = Object.keys(reportData[category]).sort().reverse()
      } else {
        reportData = res.data
        categories = Object.keys(res.data)
        if (this.state.category === null) {
          category = categories.length > 0 ? categories[0] : null
        } else {
          category = this.state.category
        }
        subcategories = []
      }

      categories.sort(this.categoryComparator)

      const subcategory = this.state.subcategory === null ? (subcategories.length > 0 ? subcategories[0] : null) : this.state.subcategory

      this.setState({reportData,
        loading: false, categories, category,
        subcategories, subcategory })
    } catch (error) {
      this.setState({ error, loading: false })
    }
  }

  get = (url, defaultValue) => {
    return axios.get(url).then(resp => resp.data).catch(e => {
      if (defaultValue) {
        return defaultValue
      }
      throw e
    })
  }

  handleCategoryChange = (evt) => {
    const { report } = this.state
    const category = evt.target.value
    if (report === 'stats') {
      this.setState({category, subcategory: null})
    } else {
      this.setState({category, subcategory: null})
    }
    this.loadReport(`/${report}.json`)
  }

  handleSubcategoryChange = (evt) => {
    const { report } = this.state
    const subcategory = evt.target.value
    this.setState({subcategory})
    this.loadReport(`/${report}.json`)
  }

  renderControls = () => {
    const { categories, category, subcategories, subcategory } = this.state

    let subcategorySelect = null
    if (subcategories.length > 0) {
      subcategorySelect = (
        <select
          defaultValue={subcategory}
          onChange={this.handleSubcategoryChange}>
          {subcategories.map(
            val => <option key={val}>{val}</option>
          )}
        </select>
      )
    }
    return (
      <div className="filterSelect">
        <select
          defaultValue={category}
          onChange={this.handleCategoryChange}>
          {categories.map(
            val => <option key={val}>{val}</option>
          )}
        </select>
        {subcategorySelect}
      </div>
    )
  }

  render () {
    const { loading, error, reportData, report, category, subcategory } = this.state

    if (loading) {
      return (
        <div className='Reports'>
          Loading...
        </div>
      )
    } else if (error) {
      if (error.response && error.response.status === 404) {
        return (
          <div className='Reports'>
            Specified <a href={`/${report}.json`}>report</a> does not currently exist.
          </div>
        )
      }
      return (
        <div className='Reports'>
          Unexpected Error!
        </div>
      )
    }

    const columns = [{
      Header: 'Content',
      accessor: 'resource',
      Cell: row => (
        <a href={row.value}>{decodeURIComponent(row.value)}</a>
      )
    }, {
      Header: 'Hits',
      accessor: 'count',
      style: {textAlign: 'center'}
    }]

    return (
      <div className='Reports'>
        <div className='header'>
          {this.renderControls()}
        </div>
        <ReactTable
          data={report === 'stats' ? reportData[category][subcategory] : reportData[category]}
          columns={columns}
          defaultPageSize={10}
          pageSizeOptions={[10, 20, 100]}
          showPageSizeOptions={report !== 'stats.top10'}
          showPageJump
        />
        <div className='footer'>
          <span>Download <a href={`/${report}.json`}>report</a></span>
        </div>
      </div>
    )
  }
}

export default Reports
