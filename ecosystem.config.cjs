module.exports = {
    apps:[
      {
        name:"Servidor 1",
        script:'src/app.js',
        env:{
          PORT:8080
        }
      },
      {
        name:"Servidor 2",
        script:'src/app.js',
        env:{
          PORT:8081
        }
      },
      {
        name:"Servidor 3",
        script:'src/app.js',
        env:{
          PORT:8082
        },
        instances:1,
        exec_mode:'fork'
      },
      {
        name:"Servidor 4",
        script:'src/app.js',
        env:{
          PORT:8083
        },
        instances:1,
        exec_mode:'fork'
      }
    ]
  }