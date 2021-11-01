import axios from 'axios'
import decode from 'jwt-decode'

class UserService {
    private URI: string;

    constructor() {
        this.URI = 'PLACEHOLDER';

    }

    login(username: string, password: string) {
        return axios.post(`${this.URI}`, {username: username, password: password}).then(response => {
           if(response.status === 200) {
               let decoded: any =  decode(response.data);
               return decoded;
               //Dispatch login event;
           } 
        });
    }

    register(nameOf: string, birthday: string, username: string, password: string) {
        return axios.post(`${this.URI}`, {name: name, birthday: birthday, username: username, password: password}).then(response => {
            if(response.status === 200) {
                let decoded: any = decode(response.data);
                return decoded;
            }
        })
    }
}