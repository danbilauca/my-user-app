( function ( $ ) {

	const BASE_URL = 'https://api.danbilauca.click/users';
	const UsersCollection = new Map();

	function getUsers () {
		return new Promise( function ( resolve, reject ) {
			$.get( BASE_URL, function ( response ) {
				resolve( response );
			} ).fail( function () {
				reject();
			} );
		} );
	}

	function renderUsers ( users ) {

		if ( users.length ) {
			$( '#users' ).html( '' );
		} else {
			$( '#users' ).html( '<li>no user yet</li>' );
		}

		UsersCollection.clear();

		for ( let user of users ) {
			$( '#users' ).append( userTemplate( user ) );
			UsersCollection.set( user.id, user );
		}

		bindUsers();
	}

	function bindUsers () {

		// Delete user
		$( '.delete-user' ).off( 'click' ).on( 'click', function () {
			const id = this.dataset.id;
			$( this ).html( 'Deleting...' );
			$( this ).attr( 'disabled', true );
			deleteUser( id )
				.then( ( response ) => {
					renderUsers( response );
				} )
				.catch( () => {
					alert( 'Could not delete user' );
					$this.html( 'Delete' );
				} );
		} );

		$( '.edit-user' ).off( 'click' ).on( 'click', function () {
			const id = parseInt( this.dataset.id );
			const user = UsersCollection.get( id );
			const $row = $( this ).closest( 'li' );
			$row.replaceWith( editFormTemplate( user ) );
		} );
	}

	function deleteUser ( userId ) {
		return new Promise( function ( resolve, reject ) {
			$.ajax( {
				type: 'DELETE',
				contentType: 'application/json',
				dataType: 'json',
				url: `${BASE_URL}`,
				data: JSON.stringify( {user: {id: userId}} ),
			} )
				.done( function ( response ) {
					resolve( response );
				} )
				.fail( function ( response ) {
					reject( response );
				} );
		} );
	}

	function saveUser ( user ) {
		return new Promise( function ( resolve, reject ) {
			$.ajax( {
				type: user.id ? 'PUT' : 'POST',
				contentType: 'application/json',
				dataType: 'json',
				url: `${BASE_URL}`,
				data: JSON.stringify( {user} ),
			} )
				.done( function ( response ) {
					resolve( response );
				} )
				.fail( function ( response ) {
					reject( response );
				} );
		} );
	}

	function editFormTemplate ( user ) {

		const $li = $( '<li>' );
		const $form = $( `<form data-id="${user.id}">` );

		$form.append( `<input type="text" name="name" value="${user.name}" />` );
		$form.append( `<input type="text" name="age" value="${user.age}" />` );
		$form.append( `<input type="submit" name="save" value="Save" />` );
		$form.append( `<input type="reset" name="reset" value="Cancel" />` );

		$form.on( 'submit', function ( e ) {
			e.preventDefault();
			const formData = new FormData( this );
			const user = {};
			for ( const item of formData.entries() ) {
				user[ item[ 0 ] ] = item[ 1 ];
			}
			user.id = parseInt( this.dataset.id );

			$( this ).html( 'Saving...' );

			saveUser( user )
				.then( function ( response ) {
					renderUsers( response );
				} )
				.catch( function () {
					alert( 'Could not save user' );
				} );
		} );

		$form.on( 'reset', function ( e ) {
			e.preventDefault();
			$li.replaceWith( userTemplate( user ) );
			bindUsers();
		} );

		return $li.append( $form );
	}

	function userTemplate ( user ) {
		const $li = $( '<li>' );
		$li.append( `<div>${user.name}</div>` );
		$li.append( `<div>${user.age}</div>` );
		$li.append( `<div>
						<button class="delete-user" data-id="${user.id}">Delete</button>
						<button class="edit-user" data-id="${user.id}">Edit</button>
					</div>` );
		return $li;
	}

	$( function () {

		getUsers()
			.then( function ( response ) {
				renderUsers( response );
			} )
			.catch( function () {
				$( '#users' ).html( '<li>Could not load users list</li>' );
			} );

		$( '#refresh' ).on( 'click', function () {
			$( '#users' ).html( '<li>Loading...</li>' );
			const $this = $( this );
			$this.text( 'Refreshing...' );
			getUsers()
				.then( function ( response ) {
					renderUsers( response );
					$this.text( 'Refresh list' );
				} )
				.catch( function () {
					$( '#users' ).html( '<li>Could not load users list</li>' );
				} );
		} );

		$( '#addUserForm' ).on( 'submit', function ( e ) {

			e.preventDefault();

			const $submit = $( "#submit" );

			$submit.attr( "disabled", true );
			$submit.val( "Saving..." );

			const user = {};

			const formData = new FormData( this );
			for ( const item of formData.entries() ) {
				user[ item[ 0 ] ] = item[ 1 ];
			}

			saveUser( user )
				.then( ( response ) => {
					renderUsers( response );
					$submit.attr( "disabled", false );
					$submit.val( "Add" );
					this.reset();
				} )
				.catch( function () {
					alert( 'Could not add user' );
				} );
		} );

	} );

} )( jQuery );
