const fs = require('fs')

module.exports = (api, options) => {

  // List template files
  const files = {
    [`./src/views/${options.name.pascalCase}/index.js`]: `./template/index.js`,
    [`./src/views/${options.name.pascalCase}/${options.name.pascalCase}.js`]: `./template/view.js`,
    [`./src/views/${options.name.pascalCase}/${options.name.pascalCase}.vue`]: `./template/view.vue`,
    [`./src/views/${options.name.pascalCase}/${options.name.pascalCase}.scss`]: `./template/view.scss`
  }

  // Render template
  api.render(files, {
    ...options,
  })

  // Inject exports
  api.onCreateComplete(() => {

    // Inject index file
    const indexFilePath = api.resolve('./src/views/index.js')
    let indexFileContent = fs.readFileSync(indexFilePath, { encoding: 'utf8' })

    indexFileContent = `export { default as ${options.name.pascalCase} } from \'./${options.name.pascalCase}\';\n`+indexFileContent;

    fs.writeFileSync(indexFilePath, indexFileContent, { encoding: 'utf8' })

    // If user want to generate a route
    if(options.routes) {
      const routesFilePath = api.resolve('./src/router/routes.js')
      let routesFileContent = fs.readFileSync(routesFilePath, { encoding: 'utf8' })

      routesFileContent = routesFileContent
      .replace(/(\} from \'@\/views\')/, (`\t${options.name.pascalCase},\n} from \'@/views\'`))
      .replace(/export default \[/, (
        `export default [\t{\t\tpath: '${options.routePath}',\t\tname: '${options.routeName}',\t\tcomponent: ${options.name.pascalCase},\t\tmeta: {\t\t\ttitle: '${options.routeTitle}',\t\t},\t},`
      ))
    
      fs.writeFileSync(routesFilePath, routesFileContent, { encoding: 'utf8' })
    }
  });

}