import React, { Fragment } from 'react'
import PropTypes from 'prop-types'
import { CSSTransition, TransitionGroup } from 'react-transition-group'
import { ToastContainer, Flip } from 'react-toastify'

import 'react-toastify/dist/ReactToastify.min.css'

import Header from './Header'
import Footer from './Footer'
import Loading from './Loading'

const TIMEOUT = 200

const AppContainer = props => {
  return (
    <Fragment>
      <ToastContainer transition={Flip} hideProgressBar autoClose={3000} />
      <Header />
      <TransitionGroup component={null}>
        <CSSTransition
          key={props.router?.route || 'page'}
          timeout={TIMEOUT}
          classNames="page-transition"
        >
          <div>{props.children}</div>
        </CSSTransition>
      </TransitionGroup>
      <Footer />
      <style global jsx>{`
        html {
          height: 100%;
        }
        body {
          min-height: 100%;
          position: relative;
          padding-top: 4.5rem;
          padding-bottom: 5rem;
        }
        .page-transition-enter {
          opacity: 0;
          transform: translate3d(0, 20px, 0);
        }
        .page-transition-enter-active {
          opacity: 1;
          transform: translate3d(0, 0, 0);
          transition: opacity ${TIMEOUT}ms, transform ${TIMEOUT}ms;
        }
        .page-transition-exit {
          opacity: 1;
        }
        .page-transition-exit-active {
          opacity: 0;
          transition: opacity ${TIMEOUT}ms;
        }
        .indicator-appear,
        .indicator-enter {
          opacity: 0;
        }
        .indicator-appear-active,
        .indicator-enter-active {
          opacity: 1;
          transition: opacity 200ms;
        }
      `}</style>
    </Fragment>
  )
}

AppContainer.propTypes = {
  children: PropTypes.node.isRequired,
}

export default AppContainer
