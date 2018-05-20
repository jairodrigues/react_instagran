import React, { Component } from 'react';
import {Link} from 'react-router';


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
        .then(like => {
          this.setState({likeada : !this.state.likeada})          
        })
    }

    render(){
        return (
            <section className="fotoAtualizacoes">
            <a onClick={this.like} className={this.state.likeada ? 'fotoAtualizacoes-like-ativo' : 'fotoAtualizacoes-like'}>Linkar</a>
              <form className="fotoAtualizacoes-form">
                <input type="text" placeholder="Adicione um comentário..." className="fotoAtualizacoes-form-campo"/>
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
  render(){
    const { foto } = this.props
    return(
      <div className="foto-in fo">
        <div className="foto-info-likes">
          {
            foto.likers.map(liker => {
              return (<Link key={liker.login} href={`/timeline/${liker.login}`}>{liker.login}</Link>)
            })
          }
          curtiram
        </div>
        <p className="foto-info-legenda">
          <a className="foto-info-autor">autor</a>
          {foto.comentario}  
        </p>
        <ul className="foto-info-comentarios">
        {
          foto.comentarios.map(comentario => {
            return (
              <li className="comentario">
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