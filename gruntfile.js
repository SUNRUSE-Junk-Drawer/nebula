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
                    mangle: true,
                    screwIE8: false
                },
                files: [{
                    src: "src/*.js",
                    dest: "dist/index.js"                    
                }, {
                    src: ["src/battle/!(footer).js", "src/battle/footer.js"],
                    dest: "dist/battle.js"
                }, {
                    src: ["src/navigation/!(footer).js", "src/navigation/footer.js"],
                    dest: "dist/navigation.js"
                }, {
                    expand: true,
                    src: "**/*.js",
                    dest: "dist/rooms",
                    cwd: "src/rooms"            
                }, {
                    expand: true,
                    src: "**/*.js",
                    dest: "dist/navigation",
                    cwd: "src/navigation"            
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