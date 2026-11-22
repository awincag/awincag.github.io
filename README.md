# Portfolio site

Jekyll source for https://cag.win/.

## Local preview

The production publishing source is `master` (repository root). Work on a separate branch and merge only after review.

From a clone of this repository:

```sh
git fetch origin
git switch portfolio-refresh-2026
bundle install
bundle exec jekyll serve --livereload
```

Open http://localhost:4000/ and http://localhost:4000/work.html. Keep the server running in one terminal. In a second terminal in the same checkout, run `git pull --ff-only` to bring in new commits; Jekyll rebuilds and reloads the browser when it detects source changes. Restart the server after configuration or dependency changes.

The existing Gemfile.lock was created with Ruby 3.0.0 and Bundler 2.2.3 on Apple Silicon. Local toolchain or platform changes may be needed on other machines. Do not edit generated `_site/` files by hand.
