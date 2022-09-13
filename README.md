[![Actions Status](https://github.com/UziTech/nstl/workflows/tests/badge.svg)](https://github.com/UziTech/nstl/actions)

# <sup>I</sup>NST<sup>A</sup>L<sup>L</sup>

Install packages with `npm`, `yarn`, or `pnpm` based on the lock file present in the repo.

## Why?

maintaining multiple repos with different packages managers has become very difficult. Not only do you have to remember which package manager to use, you have to remember which commands and options to use.

NPM uses `install` to install all packages and new packages, while Yarn uses `install` for all packages and `add` for new packages. If you want to install dev packages NPM uses `--save-dev`, but Yarn uses `--dev`, but PNPM uses `--save-dev` for new packages and `--dev` for all packages (WTF!!!)

![XKCD Standards](https://imgs.xkcd.com/comics/standards.png)

Unfortunately someone has to do it.

## Installation

```sh
npm i -g nstl [yarn] [pnpm]
```
## Usage

### Install All Dependencies

Install all dependencies by running `nstl` without any other arguments:

```sh
nstl
```

### Add New Dependencies

Add dependencies by including the name of the dependency as an argument:

```sh
nstl package-to-add
```

To install multiple packages add each dependency as an argument:

```sh
nstl package-1 package-2
```

`add`, `install`, and `i` can be used to be more explicit:

```sh
nstl install package-1 package-2
```

### Add Dev Dependencies

Add dev dependencies with `--save-dev`, `--dev`, or `-D`:

```sh
nstl --dev package-1 package-2
```
### Remove Dependencies

Remove dependencies with `remove`, `uninstall`, or `un`:

```sh
nstl uninstall package-1 package-2
```
