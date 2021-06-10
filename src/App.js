import React, { Component } from "react";
import { Container,Menu,Dropdown } from "semantic-ui-react";
import { HashRouter, Route, Switch,Link,} from "react-router-dom";
import Votings from "./components/Votings";
import Metamask from "./components/Metamask";
import Metamask_Error from "./components/Metamask_Error";
import Register from "./components/Register";
import Error from "./components/Error";
import ViewVoting from "./components/ViewVoting";
import New_Voting from "./components/New_Voting";
import Registration from "./components/Registration";



class App extends Component {
  render() {
      return (
          <HashRouter>
              <Menu  className="top" color="green"  main inverted large   >                         
                        <Menu.Item active item position="center" color="black" large className="normal" className="p1" as={Link} to="/" >
                            Ethereum голосование
                        </Menu.Item>                       
                        <Menu.Menu position="right" >
                            <Dropdown item text="Помощь" className="normal" className="p2">
                                <Dropdown.Menu>
                                    <Dropdown.Item as={Link} to="/Metamask">
                                        Metamask
                                    </Dropdown.Item>
                                    <Dropdown.Item as={Link} to="/Register">
                                        Регистрация
                                    </Dropdown.Item>
                                </Dropdown.Menu>
                            </Dropdown>
                        </Menu.Menu>                   
                </Menu>
              <Container style={{ margin: "2em" ,float: "center"}}>
                  
                  <link
                      rel="stylesheet"
                      href="//cdn.jsdelivr.net/npm/semantic-ui@2.4.2/dist/semantic.min.css"
                  />
                  <Switch>                     
                      <Route path="/Registration"component={Registration}/>
                      <Route path="/" exact component={Votings} />
                      <Route path="/New" component={New_Voting} />
                      <Route path="/Metamask" component={Metamask} />
                      <Route path="/Voting/:address" component={ViewVoting}/>
                      <Route path="/Error_Network" component={Metamask_Error}/>
                      <Route path="/Register" component={Register} />                      
                      <Route component={Error} />
                  </Switch>
              </Container>
          </HashRouter>
      );
  }
}

export default App;
