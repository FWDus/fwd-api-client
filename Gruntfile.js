module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    coffee: {
      options: {
        bare: true
      },
      compile: {
        files: {
          'dist/fwd-api.full.js': [
            'src/fwd.coffee',
            'src/url.coffee',
            'src/helpers.coffee',
            'src/model.coffee',
            'src/*.coffee'
          ]
        }
      }
    },
    uglify: {
      build: {
        files: {
          'dist/fwd-api.full.min.js': ['dist/fwd-api.full.js']
        }
      }
    },
    watch: {
      scripts: {
        files: ['src/*.coffee'],
        tasks: ['default']
      },
      configFiles: {
        files: ['Gruntfile.js'],
        options: {
          reload: true
        }
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-coffee');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // Default task(s).
  grunt.registerTask('default', ['coffee', 'uglify']);
};