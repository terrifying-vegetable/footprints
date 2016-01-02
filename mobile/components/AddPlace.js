'use strict';

var React = require('react-native');
var ViewCreatedTour = require('./ViewCreatedTour');
var SelectImage = require('./SelectImage');
var utils = require('../lib/utility');
var t = require('tcomb-form-native');
var Form = t.form.Form;
var formStyles = require('../lib/form_stylesheet');
var styles = require('../lib/stylesheet');
var {GooglePlacesAutocomplete} = require('react-native-google-places-autocomplete');


var {
  Component,
  StyleSheet,
  Text,
  TextInput,
  TouchableHighlight,
  View,
  Image
} = React;

// Place defines domain model for form.
var Place = t.struct({
  placeName: t.maybe(t.String),
  // address: t.maybe(t.String),
  description: t.maybe(t.String),
  placeOrder: t.maybe(t.Number)
});

class AddPlace extends Component {
  
  /**
   * Creates an instance of AddPlace.
   */
  constructor(props) {
    super(props);
    this.state = {
      tourId: this.props.tourId || this.props.route.passProps.tourId,
      placeId: null,
      placeName: '',
      description: '',
      placeOrder: '',
      address: '',
      numPlacesInTour: 0
    };
  }

  componentWillMount () {
    var component = this;
    var options = {
      reqBody: {},
      reqParam: this.state.tourId
    }; 
    utils.makeRequest('tour', component, options)
    .then((response) => {
      this.setState({numPlacesInTour: response.places.length, placeOrder: response.places.length+1})
    })
    .done();
  }

  /**
   * Gets place details using tcomb-form-native getValue method and posts it in the database.
   */
  onPressSave () {
    /**
     * getValue() gets the values of the form.
     */
    var tourId = this.state.tourId;

    var options = {
      reqBody: {
                placeName: this.state.placeName,
                address: this.state.address,
                description: this.state.description,
                placeOrder: this.state.placeOrder,
                tourId: tourId
              }
    };

    var component = this;
    utils.makeRequest('addPlace', component, options)
      .then(response => {
        component.setState({
          placeId: response.id.placeId
        });
        var options = {
            reqBody: { placeOrder: component.state.placeOrder, placeId: component.state.placeId},
            reqParam: component.state.tourId
        };
        var props = {
          placeId: component.state.placeId,
          tourId: component.state.tourId,
          addPlaceView: true
        };
        if(component.state.placeOrder <= component.state.numPlacesInTour) {
          utils.makeRequest('placeOrders', component, options)
          .then(response => {
            utils.navigateTo.call(component, "Add a Photo", SelectImage, props);
          });
        } else {
          utils.navigateTo.call(component, "Add a Photo", SelectImage, props);
        }
      });
  }

  addPhoto() {
    /*TODO: this should send a put request to update place photo, needs placeId*/
    var tourId = this.state.tourId;
    utils.navigateTo.call(this, "Select a Photo", SelectImage, {tourId});
  }

  onChange(value) {
    this.setState(value);
  }

  /**
   * renders a form generated by tcomb-form-native based on the domain model 'Place'.
   */
  render () {
    var options = {
      auto: 'placeholders',
      fields: {
        placeName: {
          placeholder: 'Place',
          placeholderTextColor: '#808080',
        },
        description: {
          placeholder: 'Description',
          placeholderTextColor: '#808080'
        },
        placeOrder: {
          placeholder: 'Stop # out of ' + this.state.placeOrder + ' stops',
          placeholderTextColor: '#808080'
        }
      },
      stylesheet: formStyles
    };
    return (
      <View style={ styles.addPlaceContainer }>
        <View style={{marginTop: 70}}>
          <Form
            ref="form"
            type={ Place }
            options={ options }
            value={this.state.value}
            onChange={this.onChange.bind(this)}/>
        </View>

      <GooglePlacesAutocomplete
        placeholder='Address or place'
        placeholderTextColor='#808080'
        minLength={3} // minimum length of text to search 
        autoFocus={false}
        fetchDetails={true}
        onPress={(data, details = null) => { // 'details' is provided when fetchDetails = true 
          var lat = details.geometry.location.lat;
          var lng = details.geometry.location.lng;
          this.setState({ address: details.formatted_address + '|' + lat + '|' + lng });
        }}
        styles={ utils.googlePlacesStylesCreateTour }
        getDefaultValue={() => { return ''; }}
        query={{ key: 'AIzaSyBpYCMNdcQg05gC87GcQeEw866rHpA9V1o', language: 'en', }}       
        GooglePlacesSearchQuery={{ rankby: 'distance', }}/>
 
          {/*<TouchableHighlight onPress={ this.addPhoto.bind(this) } underlayColor='#727272' style={{marginTop: 25}}>
            <View style={ styles.photoAudioContainer }>   
              <View style={{marginTop: 25}}>
                <Text style={ styles.text }>Add a Photo</Text>
              </View>
              <View>
                <Image source={require('../assets/photoicon.png')} style={styles.photoIcon}/> 
              </View>
            </View>   
          </TouchableHighlight>
          
            
          <TouchableHighlight onPress={() => alert('add Audio')} underlayColor='#727272' style={{marginTop: 20}}>
            <View style={ styles.photoAudioContainer }>
              <View style={{marginTop: 25}}>
                <Text style={ styles.text }>Add Audio</Text>
              </View>
              <View>
                <Image source={require('../assets/audioicon.png')} style={styles.audioIcon}/>
              </View>
            </View>  
          </TouchableHighlight>*/}

        <TouchableHighlight 
          style={ [styles.button, {marginBottom: 45}, {padding: 10}] } 
          onPress={ this.onPressSave.bind(this) } 
          underlayColor='#FFC107'>
          <Text style={ styles.buttonText }>Next</Text>
        </TouchableHighlight>
      </View>
    );
  }
};

module.exports = AddPlace;
