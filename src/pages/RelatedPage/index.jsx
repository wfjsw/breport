import { hot } from 'react-hot-loader'
import React, { Component, Fragment } from 'react'
import { connect } from 'react-redux'
import isEqual from 'lodash/isEqual'
import startsWith from 'lodash/startsWith'

import routerHistory from 'utils/routerHistory'
import { getRelatedData, getRelatedDataStub, parseData, setBrInfo } from 'reducers/related'
import { Spinner } from 'components'
import { ControlPanel, BrInfo, Footer } from 'widgets'
import { formatZkillTimestamp } from 'utils/FormatUtils'
import RelatedService from 'api/RelatedService'
import Report from 'pages/Report'
import styles from './styles.scss'


class RelatedPage extends Component {

  state = {
    saving: false,
  }

  componentDidMount() {
    const { names, params: { systemID, time }, relatedSystemID, relatedDatetime } = this.props
    // come from zkillboard, smth like this https://br.evetools.org/related/30000503/1560456000/
    if (!startsWith(time, '20')) { // 2019
      const zTime = formatZkillTimestamp(time)
      console.log(`transform timestamp ${time} to zTime: ${zTime}`)
      window.location.replace(`${window.location.origin}/related/${systemID}/${zTime}`)
      return
    }

    const isNewRelated = parseInt(systemID, 10) !== relatedSystemID || time !== relatedDatetime
    if (names.isLoading || isNewRelated) {
      this.fetchData()
    }
  }

  componentDidUpdate(prevProps) {
    const { names } = this.props
    if (prevProps.names.isLoading && !names.isLoading) {
      this.props.parseData()
    }
  }

  handleReparse = () => {
    this.props.parseData()
  }

  fetchData = () => {
    const { params: { systemID, time }, isStub } = this.props
    if (isStub) {
      console.warn('THIS IS STUB. Params:', systemID, time)
      this.props.getRelatedDataStub(systemID, time)
    } else {
      console.log('fetching:', systemID, time)
      this.props.getRelatedData(systemID, time)
    }
  }

  handleSaveBR = () => {
    const { params: { systemID, time }, isStub } = this.props
    if (isStub || this.state.saving) return
    const { teams, ...rest } = this.props
    if (process.env.NODE_ENV === 'development') {
      console.log('teams:', teams, rest.location.pathname)
    }

    this.setState({ saving: true }, async () => {
      RelatedService.saveComposition(teams, systemID, time)
        .then(({ data }) => {
          this.setState({ saving: false })
          this.props.setBrInfo([{
            relatedKey: `${systemID}/${time}`,
            teams,
          }])
          routerHistory.push(`/br/${data.result.id}`)
        })
        .catch(err => {
          this.setState({ saving: false })
          console.error('err:', err)
        })
    })
  }

  isTeamsChanged() {
    const { teams, origTeams } = this.props
    if (!teams) {
      return false
    }
    return !isEqual(teams, origTeams)
  }

  renderContent() {
    const { reportType, saving } = this.state
    const { error, stillProcessing, data = [], teams, names, params, kmLoading } = this.props
    const isError = error || names.error
    // const isLoading = names.isLoading || kmLoading
    const isLoading = kmLoading

    let header = ''
    if (stillProcessing || isError === 'processing') {
      header = 'processing...'
    } else if (isError) {
      header = 'failed to fetch.'
    } else if (isLoading) {
      header = 'loading...'
    } else {
      header = `${data.length} killmails`
    }

    return (
      <Fragment>
        <ControlPanel
          header={header}
          isLoading={isLoading}
          error={isError}
          saving={saving}
          onReload={this.fetchData}
          onReparse={this.handleReparse}
          onSaveBR={this.handleSaveBR}
          canSave={this.isTeamsChanged()}
        />
        {!isError && !isLoading &&
          <Fragment>
            <BrInfo routerParams={params} />
            <div className={styles.space} />
            <Report
              teams={teams}
              isLoading={isLoading}
              reportType={reportType}
              routerParams={params}
            />
          </Fragment>
        }
        {isLoading &&
          <Spinner />
        }
        <Footer />
      </Fragment>
    )
  }

  render() {
    return (
      <div className={styles.appRoot}>
        {this.renderContent()}
      </div>
    )
  }
}

const mapDispatchToProps = { getRelatedData, getRelatedDataStub, parseData, setBrInfo }
const mapStateToProps = ({ related, names }, { match: { params } }) => ({
  isStub: related.isStub,
  error: related.error,
  data: related.kmData || [],
  teams: related.teams,
  origTeams: related.origTeams,
  names: names.involvedNames,
  kmLoading: related.kmLoading,
  stillProcessing: related.stillProcessing,
  relatedSystemID: related.systemID,
  relatedDatetime: related.datetime,
  params,
})

const ConnectedRelatedPage = connect(mapStateToProps, mapDispatchToProps)(RelatedPage)
export default hot(module)(ConnectedRelatedPage)
