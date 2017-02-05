import React from 'react';
import Measure from 'react-measure';
import ColorInterpolation from 'color-interpolate';
import SlideHelper from './../../utils/client/SlideHelper';

import WelcomeItem from './WelcomeItem/WelcomeItem';
import WelcomeMenu from './WelcomeMenu/WelcomeMenu';

class WelcomePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      position: 0, // current visible item number
      // The dimensions of the card, used internally
      dimensions: {
        width: 1, // Default value only
        height: 1, // Default value only
        measured: false,
      },
      // Used by the sliding movement
      displacement: {
        x: 0, // Used to animate  movement
      },
      // When sliding left should not enable slideHelper (it should be disabled)
      slidingLeft: false,
    };

    this.slider = null;

    this.slideLeft = this.slideLeft.bind(this);
  }

  componentWillUnmount() {
    if (this.slider) {
      this.slider.disable();
      this.slider = null;
    }
  }

  updateSlider() {
    if (!this.slider) {
      // Create and instantiate a SlideHelper
      const disableLeft = this.state.position === 1;
      const disableRight = this.state.position === 0;
      const $welcomePageItems = $(this.welcomePageItems);

      const stateUpdateHandler = (stateXRaw) => {
        // Avoid bounce when stateX is above limits; makes an upper bound of 1
        const stateX = Math.sign(stateXRaw) * Math.min(Math.abs(stateXRaw), 1);

        if (this.state.displacement.x !== stateX * this.state.dimensions.width) {
          this.setState({
            displacement: {
              x: stateX * this.state.dimensions.width,
            },
          });
        }
      };

      const rightHandler = () => {
        this.setState({
          position: this.state.position - 1,
          displacement: {
            x: 0,
          },
        });
      };

      const leftHandler = () => {
        this.setState({
          position: this.state.position + 1,
          displacement: {
            x: 0,
          },
        });
      };

      const finishHandler = () => {
        this.slider = null;
      };

      const slideHelperProps = {
        $element: $welcomePageItems,
        size: this.state.dimensions.width,
        exitThreshold: this.state.dimensions.width * 0.55,
        exitThresholdSpeed: Math.ceil(this.state.dimensions.width / 30),
        velocityModifier: 50,
        frictionAcceleration: -0.001,
        returnSpeed: Math.ceil(this.state.dimensions.width / 30),
        rightHandler,
        leftHandler,
        finishHandler,
        stateUpdateHandler,
        disableLeft,
        disableRight,
      };

      this.slider = new SlideHelper(slideHelperProps);
    } else {
      this.slider.setSize(this.state.dimensions.width);
      this.slider.setReturnSpeed(Math.ceil(this.state.dimensions.width / 30));
      this.slider.setExitThresholdSpeed(Math.ceil(this.state.dimensions.width / 30));
    }
  }

  /**
   * Slides welcomePage to the left to show the next welcomeItem
   * @return {undefined}
   */
  slideLeft() {
    if (this.state.slidingLeft) {
      return;// If already moving left, do not accept
    }

    console.log('Started slid to the left');
    this.setState({ slidingLeft: true });
    if (this.slider) {
      this.slider.disable();
      this.slider = null;
    }
    const animationDuration = 15;// The number of frames the animation lasts
    let currentPosition = -this.state.position * this.state.dimensions.width;
    const framePositionDisplacement = -this.state.dimensions.width / animationDuration;
    let finalPosition = -(this.state.position + 1) * this.state.dimensions.width;

    /**
     * Left sliding animation frame
     */
    const slideAnimationFrame = () => {
      finalPosition = -(this.state.position + 1) * this.state.dimensions.width;
      // Updated every frame because width may change
      // console.log(currentPosition, finalPosition);

      if (currentPosition <= finalPosition) { // position is decreased because negative is left
        this.setState({
          position: this.state.position + 1,
          displacement: {
            x: 0,
          },
          slidingLeft: false,
        });

        console.log('Slidden to the left');
        return;
      }

      this.setState({ displacement: { x: currentPosition } });
      currentPosition += framePositionDisplacement;

      if (currentPosition <= finalPosition) { // position is decreased because negative is left
        currentPosition = finalPosition;
      }

      requestAnimationFrame(slideAnimationFrame);
    };

    requestAnimationFrame(slideAnimationFrame);
  }

  render() {
    console.log(this.state.dimensions.measured, !this.state.slidingLeft);
    if (this.state.dimensions.measured && !this.state.slidingLeft) {
      this.updateSlider();
    }

    const welcomeItemsContent = [
      {
        imageUrl: 'page1.png',
        backgroundColor: 'rgba(46, 204, 113, 0.8)',
        title: 'Bienvenido a Diamond Knowledge',
        description: 'Vas a poder aprender a programar y a dominar cualquier lenguaje',
      },
      {
        imageUrl: 'page2.png',
        backgroundColor: 'rgba(52, 152, 219, 0.8)',
        title: 'Aprendé de la mejor forma',
        description: 'Los cursos son cortos y eficientes para aprender rápido en cualquier lugar',
      },
      /*{
        imageUrl: 'a',
        backgroundColor: 'rgba(155, 89, 182, 0.8)',
        title: 'a',
        description: 'a',
      },
      {
        imageUrl: 'a',
        backgroundColor: 'rgba(230, 126, 34, 0.8)',
        title: 'a',
        description: 'a',
      },*/
    ];
    const welcomeItemsArray = welcomeItemsContent.map((item, index) =>
      <WelcomeItem
        key={`welcome-item-${index}`}
        {...item}
      />);

    // Creates a color palette from the array of colors constructed with welcomeItemsContent
    const colorPalette = ColorInterpolation(welcomeItemsContent.map(item => item.backgroundColor));

    const welcomePageStyle = {
      backgroundColor: colorPalette(
        this.state.position + (-this.state.displacement.x / this.state.dimensions.width)),
    };

    const welcomePageItemsStyle = {
      transform: `translateX(${this.state.displacement.x + (-this.state.position * this.state.dimensions.width)}px)`,
    };

    console.log(this.state.displacement.x);

    return (
      <div style={welcomePageStyle} id="welcome-page">
        <Measure
          onMeasure={(dimensions) => {
            this.setState({ dimensions: { ...dimensions, measured: true } });
          }}
        >
          <div
            id="welcome-page-items-container"
            style={welcomePageItemsStyle}
            ref={(welcomePageItems) => { this.welcomePageItems = welcomePageItems; }}
          >
            {
              welcomeItemsArray
            }
          </div>
        </Measure>
        <WelcomeMenu
          pagesCount={welcomeItemsArray.length}
          position={this.state.position}
          next={this.slideLeft}
        />
      </div>
    );
  }
}

export default WelcomePage;
