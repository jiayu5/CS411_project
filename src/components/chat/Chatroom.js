import React from 'react';
import './chatroom.css';
import { connect } from 'react-redux';
import { connectServer, fetchChatList, publishMessage, subscribeTopic } from '../../actions/chatAction'
import {getUserInfo} from '../../actions';

const getUniqueId = (id1, id2) => {
    // id are strings
    if(id1 > id2){
        return id2+id1;
    }else{
        return id1+id2;
    }
}

class Chatroom extends React.Component {
    state = {connect: false, subscribe: false, term: ""};

    componentDidUpdate (prevProps) {
        const auth = this.props.auth;
        console.log(this.props.auth);
        if(auth.isSignedIn){
            if(!this.state.connect){
                this.setState({connect: true});
                const id = auth.user.userId;
                // console.log("here", id);
                this.props.connectServer(id);
            }
        }
        if(this.props.imSystem.connected && !this.state.subscribe){
            this.setState({subscribe: true});
            this.props.fetchChatList(this.props.imSystem.client, getUniqueId(this.props.auth.user.userId,this.props.match.params.id));
            this.props.subscribeTopic(this.props.imSystem.client, getUniqueId(this.props.auth.user.userId,this.props.match.params.id))
        }
    }


    onFormSubmit = (event) => {
        event.preventDefault();
        this.props.publishMessage(this.props.imSystem.client, getUniqueId(this.props.auth.user.userId,this.props.match.params.id), this.state.term, this.props.auth.user.userId);
        this.setState({term: ""});
    }

    renderForm = () => {
        return (
            <form className="send-message-form" onSubmit={this.onFormSubmit} >
                    <input 
                        type="text" 
                        value={this.state.term}
                        placeholder="Type your message and hit ENTER"
                        onChange={(e) => this.setState({ term: e.target.value })}
                    />
            </form>
        );
    };

    render () {
        console.log(58, this.props.match.params.id);
        return (
            <div>
                chat
                <MessageList 
                  getUserInfo = {this.props.getUserInfo}
                  auth = {this.props.auth}
                  id = {this.state.subscribe ? this.props.auth.user.userId : 0}
                  messages={this.state.subscribe ? this.props.imSystem.chats[getUniqueId(this.props.auth.user.userId,this.props.match.params.id)] : [] } />
                {this.renderForm()}
            </div>
        );
    };
};

const mapStateToProps = (state) => {
    return {
        imSystem: state.imSystem,
        auth: state.auth
    }
}

class MessageList extends React.Component {

    messageDecode = (message) => {
        return message.split("|@&*&@|");
    }

    render() {
        return (
            <ul className="message-list">
                {this.props.messages.map((message, index) => {
                    const temp = this.messageDecode(message);
                    const userName = this.props.auth.userInfo[temp[0]] === undefined ? temp[0] : this.props.auth.userInfo[temp[0]].username;
                    const classTitle = temp[0] === this.props.id ? "messageRight" : "messageLeft";
                    if(this.props.auth.userInfo[temp[0]] === undefined){
                        this.props.getUserInfo(temp[0]);
                    }
                    return (
                      <li  key={index} className={classTitle}>
                        <div>{userName}</div>
                        <div>{temp[1]}</div>
                      </li>
                    )
                })}
            </ul>
        )
    }
}

export default connect(mapStateToProps, {getUserInfo, connectServer, fetchChatList, publishMessage, subscribeTopic})(Chatroom);