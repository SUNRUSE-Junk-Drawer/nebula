module.exports = function(grunt) {
    grunt.loadNpmTasks("grunt-contrib-copy")
    grunt.loadNpmTasks("grunt-contrib-clean")
    grunt.loadNpmTasks("grunt-contrib-uglify")
    grunt.loadNpmTasks("grunt-contrib-htmlmin")
    grunt.loadNpmTasks("grunt-contrib-watch")
    grunt.loadNpmTasks("sprigganjs")
    grunt.initConfig({
        clean: {
            dist: "dist/**/*"
        },
        copy: {
            png: {
                files: [{
                    expand: true,
                    src: "**/*.png",
                    dest: "dist",
                    cwd: "src"
                }]
            }
        },
        htmlmin: {
            html: {
                options: {
                    removeComments: true,
                    collapseWhitespace: true
                },
                files: [{
                    expand: true,
                    src: "**/*.html",
                    dest: "dist",
                    cwd: "src"
                }]
            }
        },
        uglify: {
            js: {
                options: {
                    // Allows SprigganJavaScript-parsed files.
                    bare_returns: true,
                    beautify: false,
                    compress: true,
                    mangle: true
                },
                files: [{
                    expand: true,
                    src: "**/*/*.js",
                    dest: "dist",
                    cwd: "src"
                }, {
                    src: "src/engine/**.js",
                    dest: "dist/index.js"
                }]
            }
        },
        "sprigganjs-aseprite": {
            all: {
                files: [{
                    expand: true,
                    src: "**/*.ase",
                    dest: "dist",
                    cwd: "src",
                    ext: ""
                }]
            }
        },
        watch: {
            all: {
                options: {
                    atBegin: true
                },
                files: "src/**/*",
                tasks: [
                    "clean:dist", 
                    "htmlmin",
                    "uglify",
                    "sprigganjs-aseprite"
                ]
            }
        }
    })
    grunt.registerTask("default", ["watch"])
}