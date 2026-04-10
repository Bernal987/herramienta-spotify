<?php

namespace Drupal\favoritos\Controller;

use Symfony\Component\HttpFoundation\JsonResponse;
use Drupal\node\Entity\Node;
use Drupal\Core\Session\AccountProxyInterface;
use Drupal\user\Entity\User;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Drupal\Core\DependencyInjection\ContainerInjectionInterface;

class FavoritosController implements ContainerInjectionInterface {

  protected AccountProxyInterface $currentUser;

  public function __construct(AccountProxyInterface $current_user) {
    $this->currentUser = $current_user;
  }

  public static function create(ContainerInterface $container): static {
    return new static($container->get('current_user'));
  }

  public function toggle(int $node): JsonResponse {
    $node_entity = Node::load($node);

    $bundles_permitidos = ['cancion', 'artista', 'album', 'playlist'];
    if (!$node_entity || !in_array($node_entity->bundle(), $bundles_permitidos)) {
      return new JsonResponse(['error' => 'Nodo no encontrado'], 404);
    }

    $user = User::load($this->currentUser->id());
    if (!$user) {
      return new JsonResponse(['error' => 'Usuario no autenticado'], 403);
    }

    // Comprobar si ya está en favoritos
    $favoritos = $user->get('field_favoritos')->getValue();
    $target_ids = array_column($favoritos, 'target_id');
    $es_favorito = in_array($node, $target_ids);

    if ($es_favorito) {
      // Eliminar de favoritos
      $nuevos = array_filter($favoritos, fn($item) => (int) $item['target_id'] !== $node);
      $user->set('field_favoritos', array_values($nuevos));
    }
    else {
      // Añadir a favoritos
      $user->get('field_favoritos')->appendItem(['target_id' => $node]);
    }

    $user->save();

    return new JsonResponse([
      'activo' => !$es_favorito,
      'node'   => $node,
    ]);
  }

}
