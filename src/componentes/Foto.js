import React, { Component } from 'react';
import {Link} from 'react-router';
import Pubsub from 'pubsub-js';

class FotoAtualizacoes extends Component {

    constructor(props){
      super(props);
      this.state = {likeada : this.props.foto.likeada};
    }

    like = (event) =>{
      event.preventDefault()
      const url = `http://localhost:8080/api/fotos/${this.props.foto.id}/like`
      const opt ={
        method: 'POST',
        headers: {
          'X-AUTH-TOKEN': localStorage.getItem('auth-token')
        }
      }
      fetch(url,opt)
        .then(response => {
          if(response.ok) {
              return response.json();
          } else {
              throw new Error("não foi possível realizar o like da foto")
          }
        })
        .then(liker => {
          this.setState({likeada : !this.state.likeada})  
          Pubsub.publish('atualiza-liker',{fotoId:this.props.foto.id,liker})        
        })
    }

    comenta = (event) => {
      event.preventDefault();
      const url = `http://localhost:8080/api/fotos/${this.props.foto.id}/comment`
      const opt = {
        method: 'POST',
        body: JSON.stringify({texto: this.comentario.value}),
        headers: {
          'Content-type':'application/json',
          'X-AUTH-TOKEN': localStorage.getItem('auth-token')
        }
      }
      fetch(url,opt) 
        .then(response => {
          if(response.ok){
            return response.json()
          }else{
            throw new Error ("não foi possivel comentar")
          }
        })
        .then(novoComentario => {
          Pubsub.publish('novos-comentarios', {fotoId:this.props.foto.id, novoComentario})
        })
    };

    render(){
        return (
            <section className="fotoAtualizacoes">
            <a onClick={this.like} className={this.state.likeada ? 'fotoAtualizacoes-like-ativo' : 'fotoAtualizacoes-like'}>Linkar</a>
              <form className="fotoAtualizacoes-form" onSubmit={this.comenta}>
                <input type="text" placeholder="Adicione um comentário..." className="fotoAtualizacoes-form-campo" ref={(input) => this.comentario = input}/>
                <input type="submit" value="Comentar!" className="fotoAtualizacoes-form-submit"/>
              </form>

            </section>            
        );
    }
}

class FotoHeader extends Component {
    render(){
      const { foto } = this.props
        return (
            <header className="foto-header">
              <figure className="foto-usuario">
               <img src={foto.urlPerfil} alt="foto do usuario"/>
                <figcaption className="foto-usuario">
                  <Link to={`/timeline/${this.props.foto.loginUsuario}`}>
                    {this.props.foto.loginUsuario}
                  </Link>
                </figcaption>
              </figure>
              <time className="foto-data">{foto.horario}</time>
            </header>            
        );
    }
}

class FotoInfo extends Component{

  constructor(props){
    super(props);
    this.state = {
      likers : this.props.foto.likers,
      comentarios:this.props.foto.comentarios
    }
  }

  componentWillMount(){
    Pubsub.subscribe('atualiza-liker',(topico, infoLiker) => {
      if(this.props.foto.id === infoLiker.fotoId){
        const possivelLiker = this.state.likers.find(liker => liker.login === infoLiker.liker.login)
        if(possivelLiker === undefined){
          const novosLikers = this.state.likers.concat(infoLiker.liker);
          this.setState({likers:novosLikers})
        }else{
          const novosLikers = this.state.likers.filter(liker => liker.login !== infoLiker.liker.login)
          this.setState({likers:novosLikers})
        }
      }
    })

    Pubsub.subscribe('novos-comentarios',(topico,infoComentario) => {
      if(this.props.foto.id === infoComentario.fotoId){
        const novosComentarios = this.state.comentarios.concat(infoComentario.novoComentario)
        this.setState({comentarios:novosComentarios})
      }
    }); 
    
  }


  render(){
  
    return(
      <div className="foto-in fo">
        <div className="foto-info-likes">
          {
             this.state.likers.map(liker => {
              return(<a key={liker.login} href="#">{liker.login},</a>)
            })
          }
          curtiram
        </div>
        <p className="foto-info-legenda">
          <a className="foto-info-autor">autor</a>
          {this.props.foto.comentario}  
        </p>
        <ul className="foto-info-comentarios">
        {
          this.state.comentarios.map(comentario => {
            return (
              <li className="comentario" key={comentario.id}>
                <Link to={`/timeline/${comentario.login} `} className="foto-info-autor">{comentario.login} </Link>
                {comentario.texto}
              </li>
            );
          })
        }
        </ul>
      </div>
    )  
  }
}

export default class FotoItem extends Component {
    render(){
      const { foto } = this.props
        return (
          <div className="foto">
            <FotoHeader foto={foto}/>
            <img alt="foto" className="foto-src" src={foto.urlFoto}/>
            <FotoInfo foto={foto}/>
            <FotoAtualizacoes foto={foto}/>
          </div>            
        );
    }
}