var gulp = require('gulp');
var del = require('del');
var plugins = require('gulp-load-plugins')();

gulp.task('html',function(){
	return gulp.src('src/**/*.html')
		.pipe(gulp.dest('./build'));
});

gulp.task('script',function(){
	del(['./build/scripts/**/*.js']);

	return gulp.src('src/scripts/**/*.js')
		.pipe(plugins.jshint())
		.pipe(plugins.jshint.reporter('default'))
		.pipe(plugins.jshint.reporter('fail').on('error',function(err){
			plugins.util.log(plugins.util.colors.red(err.message));
			this.emit('end');
		}))
        .pipe(plugins.ignore.exclude('*.spec.js'))
		.pipe(plugins.ngAnnotate())
		.pipe(gulp.dest('./build/scripts'))
		.on('error',plugins.util.log);
});

gulp.task('style',function(){
	del(['./build/styles/**/*.css']);

	return gulp.src('src/styles/**/*.scss')
		.pipe(plugins.sass())
		.pipe(gulp.dest('./build/styles'));		
});

gulp.task('assets',function(){
   del(['./build/assets/**']);

    return gulp.src('src/assets/**/*')
        .pipe(gulp.dest('./build/assets'));
});

gulp.task('link',['script','style','html','assets'],function(){
	var target = gulp.src('./build/**/*.html');
	var scriptSources = gulp.src(['./build/**/*.js']).pipe(plugins.angularFilesort());
	var styleSources = gulp.src(['./build/**/*.css'],{read:false});
	return target
		.pipe(plugins.inject(styleSources,{relative: true}))
		.pipe(plugins.inject(scriptSources,{relative: true}))
		.pipe(gulp.dest('./build'))
		.pipe(plugins.connect.reload());
});

gulp.task('clean',function(cb){
	del(['./build/**'],cb);
});

gulp.task('connect',function(){
	return plugins.connect.server({
		root: 'build',
		livereload: true
	});
});

gulp.task('watch',function(){	
	gulp.watch(['src/**/*'],['build']);
});

gulp.task('build',['clean'],function(){
	gulp.start('link');
    gulp.start('assets');
});

gulp.task('default',['build','connect','watch']);
